import jwt from 'jsonwebtoken';
import { config } from '@config/env.config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenManager {
  private accessSecret: string;
  private refreshSecret: string;
  private accessExpiry: string;
  private refreshExpiry: string;

  constructor() {
    this.accessSecret = config.jwt.accessSecret;
    this.refreshSecret = config.jwt.refreshSecret;
    this.accessExpiry = config.jwt.accessExpiry;
    this.refreshExpiry = config.jwt.refreshExpiry;
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.refreshSecret, {
      expiresIn: this.refreshExpiry
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, this.refreshSecret) as { userId: string };
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
