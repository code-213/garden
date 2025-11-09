import jwt from 'jsonwebtoken';
import { IAuthService, GoogleUserData, TokenPair } from '@application/interfaces/IAuthService';
import { User } from '@domain/entities/User';
import { UnauthorizedError } from '@shared/errors';
import { config } from '@config/env.config';
import { GoogleAuthService } from './GoogleAuthService';

interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number; // For token rotation tracking
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
  }

  async verifyGoogleToken(code: string): Promise<GoogleUserData> {
    try {
      return await this.googleAuthService.verifyCode(code);
    } catch (error) {
      throw new UnauthorizedError('Failed to verify Google token');
    }
  }

  async generateTokens(user: User): Promise<TokenPair> {
    const payload = {
      userId: user.id,
      email: user.email.getValue(),
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry
    } as jwt.SignOptions);

    // Include timestamp for rotation tracking
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        tokenVersion: Date.now()
      } as RefreshTokenPayload,
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry
      } as jwt.SignOptions
    );

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
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as RefreshTokenPayload;

      // Generate new access token
      const accessToken = jwt.sign({ userId: decoded.userId }, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry
      } as jwt.SignOptions);

      // ✅ Generate new refresh token (token rotation)
      const newRefreshToken = jwt.sign(
        {
          userId: decoded.userId,
          tokenVersion: Date.now()
        } as RefreshTokenPayload,
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiry
        } as jwt.SignOptions
      );

      return {
        accessToken,
        refreshToken: newRefreshToken, // Return new refresh token
        expiresIn: this.getExpirySeconds(this.accessTokenExpiry)
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token. Please log in again.');
      }
      throw new UnauthorizedError('Token verification failed. Please log in again.');
    }
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; role: string }> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as {
        userId: string;
        role: string;
      };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid access token');
      }
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
