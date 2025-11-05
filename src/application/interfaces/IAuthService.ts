import { User } from '@domain/entities/User';

export interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthService {
  verifyGoogleToken(code: string): Promise<GoogleUserData>;
  generateTokens(user: User): Promise<TokenPair>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }>;
  verifyAccessToken(token: string): Promise<{ userId: string; role: string }>;
}
