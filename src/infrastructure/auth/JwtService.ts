// src/infrastructure/auth/JwtService.ts
import jwt from 'jsonwebtoken';
import { IAuthService, GoogleUserData, TokenPair } from '@application/interfaces/IAuthService';
import { User } from '@domain/entities/User';
import { UnauthorizedError } from '@shared/errors';
import { config } from '@config/env.config';
import { GoogleAuthService } from './GoogleAuthService';

export class JwtService implements IAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
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
    });

    const refreshToken = jwt.sign({ userId: user.id }, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 1800 // 30 minutes in seconds
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as { userId: string };

      const accessToken = jwt.sign({ userId: decoded.userId }, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry
      });

      return { accessToken, expiresIn: 1800 };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
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
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }
}
