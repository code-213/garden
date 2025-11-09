import { IAuthService } from '@application/interfaces/IAuthService';
import { UnauthorizedError } from '@shared/errors';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string; // ✅ Return new refresh token too
  expiresIn: number;
}

export class RefreshTokenUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResult> {
    try {
      // Verify the refresh token is valid
      if (!dto.refreshToken || dto.refreshToken.trim() === '') {
        throw new UnauthorizedError('Refresh token is required');
      }

      const result = await this.authService.refreshAccessToken(dto.refreshToken);

      // ✅ Return both access and refresh tokens
      return {
        accessToken: result.accessToken,
        refreshToken: dto.refreshToken, // Keep the same refresh token
        expiresIn: result.expiresIn
      };
    } catch (error) {
      // Log the actual error for debugging
      throw new UnauthorizedError('Invalid or expired refresh token. Please log in again.');
    }
  }
}
