import { IAuthService } from '@application/interfaces/IAuthService';
import { UnauthorizedError } from '@shared/errors';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  expiresIn: number;
}

export class RefreshTokenUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResult> {
    try {
      const { accessToken, expiresIn } = 
        await this.authService.refreshAccessToken(dto.refreshToken);

      return { accessToken, expiresIn };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
