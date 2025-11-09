// src/application/use-cases/auth/LogoutUseCase.ts
// UPDATE THIS FILE - Implement proper logout

import { IRefreshTokenRepository } from '@domain/repositories/IRefreshTokenRepository';
import { ITokenBlacklistService } from '@infrastructure/cache/TokenBlacklistService';
import { logger } from '@shared/utils/logger';

export interface LogoutDTO {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly blacklistService: ITokenBlacklistService
  ) {}

  async execute(dto: LogoutDTO): Promise<void> {
    try {
      // 1. Blacklist the access token (so it can't be used until expiry)
      await this.blacklistService.blacklistAccessToken(dto.accessToken);

      logger.debug('Access token blacklisted', { userId: dto.userId });

      // 2. Find and invalidate the refresh token
      const storedToken = await this.refreshTokenRepository.findByToken(dto.refreshToken);

      if (storedToken) {
        // Mark token as used (effectively invalidating it)
        await this.refreshTokenRepository.markAsUsed(dto.refreshToken);

        logger.info('User logged out successfully', {
          userId: dto.userId,
          tokenId: storedToken.id,
          familyId: storedToken.familyId
        });
      } else {
        logger.warn('Logout attempted with unknown refresh token', {
          userId: dto.userId
        });
      }
    } catch (error) {
      logger.error('Error during logout:', error);
      // Don't throw - logout should always succeed on client side
      // even if server-side cleanup fails
    }
  }

  /**
   * Logout from all devices (revoke all user's tokens)
   */
  async logoutAll(userId: string, currentAccessToken: string): Promise<void> {
    try {
      // 1. Revoke all refresh tokens for the user
      await this.refreshTokenRepository.revokeAllUserTokens(userId);

      // 2. Blacklist current access token
      await this.blacklistService.blacklistAccessToken(currentAccessToken);

      // 3. Add user to global blacklist (invalidates all existing access tokens)
      await this.blacklistService.blacklistAllUserTokens(userId);

      logger.info('User logged out from all devices', { userId });
    } catch (error) {
      logger.error('Error during logout all:', error);
      throw error;
    }
  }
}
