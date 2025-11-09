import jwt from 'jsonwebtoken';
import { IAuthService, GoogleUserData, TokenPair } from '@application/interfaces/IAuthService';
import { User } from '@domain/entities/User';
import { UnauthorizedError } from '@shared/errors';
import { config } from '@config/env.config';
import { GoogleAuthService } from './GoogleAuthService';
import { logger } from '@shared/utils/logger';

interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

export class JwtService implements IAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string | number;
  private readonly refreshTokenExpiry: string | number;
  private readonly googleAuthService: GoogleAuthService;

  constructor() {
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

  async generateTokens(user: User): Promise<TokenPair> {
    const payload: AccessTokenPayload = {
      userId: user.id,
      email: user.email.getValue(),
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        tokenVersion: Date.now()
      } as RefreshTokenPayload,
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );

    logger.debug('Generated tokens for user:', { userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirySeconds(this.accessTokenExpiry)
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      // Log the token for debugging (remove in production)
      logger.debug('Attempting to refresh token');

      // First decode to check the algorithm
      const decodedHeader = jwt.decode(refreshToken, { complete: true });

      if (decodedHeader?.header.alg === 'RS256') {
        logger.error(
          'Received RS256 refresh token (Google token) instead of HS256 (backend token)'
        );
        throw new UnauthorizedError(
          'Invalid token type. Please use the refresh token from login response, not Google token.'
        );
      }

      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        this.refreshTokenSecret,
        { algorithms: ['HS256'] } // Explicitly require HS256
      ) as RefreshTokenPayload;

      logger.debug('Refresh token verified for user:', { userId: decoded.userId });

      // Generate new access token
      const accessToken = jwt.sign({ userId: decoded.userId }, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        algorithm: 'HS256'
      } as jwt.SignOptions);

      // Generate new refresh token (token rotation)
      const newRefreshToken = jwt.sign(
        {
          userId: decoded.userId,
          tokenVersion: Date.now()
        } as RefreshTokenPayload,
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          algorithm: 'HS256'
        } as jwt.SignOptions
      );

      logger.info('Successfully refreshed tokens for user:', { userId: decoded.userId });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getExpirySeconds(this.accessTokenExpiry)
      };
    } catch (error) {
      // Detailed error logging
      if (error instanceof jwt.TokenExpiredError) {
        logger.error('Refresh token expired:', { expiredAt: error.expiredAt });
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.error('Invalid refresh token:', { message: error.message });
        throw new UnauthorizedError('Invalid refresh token. Please log in again.');
      }
      if (error instanceof jwt.NotBeforeError) {
        logger.error('Refresh token not yet valid:', { date: error.date });
        throw new UnauthorizedError('Refresh token not yet valid. Please log in again.');
      }

      logger.error('Unknown token refresh error:', error);
      throw new UnauthorizedError('Token verification failed. Please log in again.');
    }
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      // Log token prefix for debugging (first 20 chars)
      logger.debug('Verifying access token:', { tokenPrefix: token.substring(0, 20) + '...' });

      // First decode to check the algorithm
      const decodedHeader = jwt.decode(token, { complete: true });

      if (decodedHeader?.header.alg === 'RS256') {
        logger.error('Received RS256 token (Google token) instead of HS256 (backend token)');
        throw new UnauthorizedError(
          'Invalid token type. Please use the access token from login response, not Google token.'
        );
      }

      const decoded = jwt.verify(
        token,
        this.accessTokenSecret,
        { algorithms: ['HS256'] } // Explicitly require HS256
      ) as AccessTokenPayload;

      logger.debug('Access token verified for user:', { userId: decoded.userId });

      return {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (error) {
      // Detailed error logging
      if (error instanceof jwt.TokenExpiredError) {
        logger.error('Access token expired:', { expiredAt: error.expiredAt });
        throw new UnauthorizedError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.error('Invalid access token:', { message: error.message });
        throw new UnauthorizedError('Invalid access token');
      }
      if (error instanceof jwt.NotBeforeError) {
        logger.error('Access token not yet valid:', { date: error.date });
        throw new UnauthorizedError('Access token not yet valid');
      }

      logger.error('Unknown token verification error:', error);
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
