import { IAuthService } from '@application/interfaces/IAuthService';
import { UnauthorizedError } from '@shared/errors';
import { logger } from '@shared/utils/logger';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshTokenUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResult> {
    try {
      // Validate input
      if (!dto.refreshToken || dto.refreshToken.trim() === '') {
        logger.warn('Refresh token missing in request');
        throw new UnauthorizedError('Refresh token is required');
      }

      logger.debug('Executing refresh token use case');

      // Attempt to refresh the token
      const result: any = await this.authService.refreshAccessToken(dto.refreshToken);

      logger.info('Token refresh successful');

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn
      };
    } catch (error) {
      // If it's already an UnauthorizedError, just rethrow it
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      // Log unexpected errors
      logger.error('Unexpected error during token refresh:', error);
      throw new UnauthorizedError('Invalid or expired refresh token. Please log in again.');
    }
  }
}
