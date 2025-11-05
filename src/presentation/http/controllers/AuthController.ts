import { Request, Response, NextFunction } from 'express';
import { GoogleLoginUseCase } from '@application/use-cases/auth/GoogleLoginUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { successResponse } from '@shared/utils/response';

export class AuthController {
  constructor(
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        throw new Error('Authorization code is required');
      }

      const result = await this.googleLoginUseCase.execute({ code });

      res.json(successResponse({
        user: {
          id: result.user.id,
          email: result.user.email.getValue(),
          name: result.user.name,
          avatar: result.user.avatar,
          bio: result.user.bio,
          location: result.user.location,
          created_at: result.user.createdAt
        },
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        expires_in: result.expiresIn
      }));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new Error('Refresh token is required');
      }

      const result = await this.refreshTokenUseCase.execute({ 
        refreshToken: refresh_token 
      });

      res.json(successResponse({
        access_token: result.accessToken,
        expires_in: result.expiresIn
      }));
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      
      res.json(successResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        joined_date: user.createdAt,
        role: user.role
      }));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Could implement token blacklisting here
      res.json(successResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }
}
