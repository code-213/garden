// src/infrastructure/auth/JwtService.ts
// UPDATE THIS FILE - COMPLETE REFACTORED VERSION

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IAuthService, GoogleUserData, TokenPair } from '@application/interfaces/IAuthService';
import { User } from '@domain/entities/User';
import { UnauthorizedError } from '@shared/errors';
import { config } from '@config/env.config';
import { GoogleAuthService } from './GoogleAuthService';
import { logger } from '@shared/utils/logger';
import { IRefreshTokenRepository } from '@domain/repositories/IRefreshTokenRepository';
import { RefreshToken, RefreshTokenProps } from '@domain/entities/RefreshToken';
import { IUserRepository } from '@domain/repositories/IUserRepository';

interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
  familyId: string;
}

interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
}

export class JwtService implements IAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string | number;
  private readonly refreshTokenExpiry: string | number;
  private readonly googleAuthService: GoogleAuthService;

  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository
  ) {
    this.accessTokenSecret = config.jwt.accessSecret;
    this.refreshTokenSecret = config.jwt.refreshSecret;
    this.accessTokenExpiry = config.jwt.accessExpiry;
    this.refreshTokenExpiry = config.jwt.refreshExpiry;

    this.googleAuthService = new GoogleAuthService();

    // Validate secrets on startup
    if (!this.accessTokenSecret || this.accessTokenSecret === 'your-access-secret') {
      logger.warn('⚠️ Using default JWT_ACCESS_SECRET - This is insecure for production!');
    }
    if (!this.refreshTokenSecret || this.refreshTokenSecret === 'your-refresh-secret') {
      logger.warn('⚠️ Using default JWT_REFRESH_SECRET - This is insecure for production!');
    }
  }

  async verifyGoogleToken(code: string): Promise<GoogleUserData> {
    try {
      return await this.googleAuthService.verifyCode(code);
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new UnauthorizedError('Failed to verify Google token');
    }
  }

  /**
   * Generate a new token pair with token rotation support
   */
  async generateTokens(user: User, deviceInfo?: DeviceInfo): Promise<TokenPair> {
    const familyId = uuidv4(); // New token family for each login

    // Generate access token
    const accessTokenPayload: AccessTokenPayload = {
      userId: user.id,
      email: user.email.getValue(),
      role: user.role
    };

    const accessToken = jwt.sign(accessTokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256'
    } as jwt.SignOptions);

    // Generate refresh token
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      familyId
    };

    const refreshToken = jwt.sign(refreshTokenPayload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      algorithm: 'HS256'
    } as jwt.SignOptions);

    // Calculate expiration date
    const expiresInSeconds = this.getExpirySeconds(this.refreshTokenExpiry);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Store refresh token in database
    const refreshTokenProps: RefreshTokenProps = {
      token: refreshToken,
      userId: user.id,
      familyId,
      expiresAt,
      isUsed: false,
      isRevoked: false,
      deviceInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.refreshTokenRepository.save(RefreshToken.create(refreshTokenProps));

    logger.info('Generated new token pair', {
      userId: user.id,
      familyId,
      expiresAt
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirySeconds(this.accessTokenExpiry)
    };
  }

  /**
   * Refresh access token with automatic token rotation
   * Implements reuse detection for security
   */
  async refreshAccessToken(
    refreshToken: string,
    deviceInfo?: DeviceInfo
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      logger.debug('Attempting to refresh token');

      // 1. Decode and check algorithm (security check)
      const decodedHeader = jwt.decode(refreshToken, { complete: true });

      if (decodedHeader?.header.alg !== 'HS256') {
        logger.error('Invalid token algorithm:', decodedHeader?.header.alg);
        throw new UnauthorizedError('Invalid token type. Expected HS256 backend token.');
      }

      // 2. Verify token signature and decode payload
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret, {
        algorithms: ['HS256']
      }) as RefreshTokenPayload;

      logger.debug('Token signature verified', {
        userId: decoded.userId,
        familyId: decoded.familyId
      });

      // 3. Find token in database
      const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

      if (!storedToken) {
        logger.error('Refresh token not found in database');
        throw new UnauthorizedError('Invalid refresh token');
      }

      // 4. Check if token is expired
      if (storedToken.isExpired()) {
        logger.warn('Refresh token expired', {
          userId: decoded.userId,
          expiresAt: storedToken.expiresAt
        });
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }

      // 5. Check if token is revoked
      if (storedToken.isRevoked) {
        logger.warn('Attempted use of revoked token', {
          userId: decoded.userId,
          familyId: decoded.familyId
        });
        throw new UnauthorizedError('Token has been revoked. Please log in again.');
      }

      // 6. CRITICAL: Check for token reuse (security breach detection)
      if (storedToken.isUsed) {
        logger.error('🚨 SECURITY ALERT: Refresh token reuse detected!', {
          userId: decoded.userId,
          familyId: decoded.familyId,
          tokenId: storedToken.id,
          wasReplacedBy: storedToken.replacedBy
        });

        // SECURITY RESPONSE: Revoke entire token family
        await this.refreshTokenRepository.revokeFamily(decoded.familyId);

        logger.error('🔒 Revoked entire token family due to reuse detection', {
          familyId: decoded.familyId
        });

        throw new UnauthorizedError(
          'Token reuse detected. All sessions have been terminated for security. Please log in again.'
        );
      }

      // 7. Get user and verify account status
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        logger.error('User not found during token refresh', { userId: decoded.userId });
        throw new UnauthorizedError('User not found');
      }

      if (!user.isActive()) {
        logger.warn('Inactive user attempted token refresh', {
          userId: decoded.userId,
          status: user.status
        });
        throw new UnauthorizedError('User account is not active');
      }

      // 8. Generate NEW tokens (rotation) with SAME family ID
      const newAccessTokenPayload: AccessTokenPayload = {
        userId: user.id,
        email: user.email.getValue(),
        role: user.role
      };

      const newAccessToken = jwt.sign(newAccessTokenPayload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        algorithm: 'HS256'
      } as jwt.SignOptions);

      const newRefreshTokenPayload: RefreshTokenPayload = {
        userId: user.id,
        familyId: decoded.familyId // Keep same family ID for rotation tracking
      };

      const newRefreshToken = jwt.sign(newRefreshTokenPayload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        algorithm: 'HS256'
      } as jwt.SignOptions);

      // 9. Store new refresh token
      const expiresInSeconds = this.getExpirySeconds(this.refreshTokenExpiry);
      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      const newRefreshTokenProps: RefreshTokenProps = {
        token: newRefreshToken,
        userId: user.id,
        familyId: decoded.familyId,
        expiresAt,
        isUsed: false,
        isRevoked: false,
        deviceInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.refreshTokenRepository.save(RefreshToken.create(newRefreshTokenProps));

      // 10. Mark old token as used and link to new token
      await this.refreshTokenRepository.markAsUsed(refreshToken, newRefreshToken);

      logger.info('Token refresh successful - tokens rotated', {
        userId: user.id,
        familyId: decoded.familyId,
        oldTokenId: storedToken.id
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getExpirySeconds(this.accessTokenExpiry)
      };
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        logger.error('Refresh token JWT expired:', { expiredAt: error.expiredAt });
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.error('Invalid refresh token JWT:', { message: error.message });
        throw new UnauthorizedError('Invalid refresh token. Please log in again.');
      }
      if (error instanceof jwt.NotBeforeError) {
        logger.error('Refresh token not yet valid:', { date: error.date });
        throw new UnauthorizedError('Refresh token not yet valid. Please log in again.');
      }

      // Re-throw UnauthorizedErrors
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      // Log and wrap unexpected errors
      logger.error('Unexpected error during token refresh:', error);
      throw new UnauthorizedError('Token verification failed. Please log in again.');
    }
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      logger.debug('Verifying access token');

      // Check algorithm
      const decodedHeader = jwt.decode(token, { complete: true });

      if (decodedHeader?.header.alg !== 'HS256') {
        logger.error('Invalid access token algorithm:', decodedHeader?.header.alg);
        throw new UnauthorizedError('Invalid token type. Expected HS256 backend token.');
      }

      // Verify signature and decode
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        algorithms: ['HS256']
      }) as AccessTokenPayload;

      logger.debug('Access token verified', { userId: decoded.userId });

      return {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.debug('Access token expired');
        throw new UnauthorizedError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.error('Invalid access token:', { message: error.message });
        throw new UnauthorizedError('Invalid access token');
      }
      if (error instanceof jwt.NotBeforeError) {
        logger.error('Access token not yet valid');
        throw new UnauthorizedError('Access token not yet valid');
      }

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      logger.error('Unexpected error verifying access token:', error);
      throw new UnauthorizedError('Token verification failed');
    }
  }

  private getExpirySeconds(expiry: string | number): number {
    if (typeof expiry === 'number') return expiry;

    // Parse string like "30m", "7d", "1h"
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, value, unit] = match;
      return parseInt(value) * units[unit];
    }

    return 1800; // Default to 30 minutes
  }
}
