// src/presentation/http/controllers/AuthController.ts
// UPDATE THIS FILE - Add register, login, and improved logout

import { Request, Response, NextFunction } from 'express';
import { GoogleLoginUseCase } from '@application/use-cases/auth/GoogleLoginUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { successResponse } from '@shared/utils/response';
import { logger } from '@shared/utils/logger';
import { AuthRequest } from '@presentation/http/middlewares/auth.middleware';

export class AuthController {
  constructor(
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) {}

  /**
   * POST /auth/register
   * Register a new user with email/password
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const result = await this.registerUseCase.execute({
        name,
        email,
        password
      });

      res.status(201).json(
        successResponse(
          {
            user: {
              id: result.user.id,
              email: result.user.email.getValue(),
              name: result.user.name,
              avatar: result.user.avatar || null,
              created_at: result.user.createdAt
            },
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
            expires_in: result.expiresIn
          },
          'Registration successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Login with email/password
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.loginUseCase.execute({
        email,
        password
      });

      res.json(
        successResponse({
          user: {
            id: result.user.id,
            email: result.user.email.getValue(),
            name: result.user.name,
            avatar: result.user.avatar || null,
            bio: result.user.bio || null,
            location: result.user.location || null,
            role: result.user.role,
            created_at: result.user.createdAt
          },
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          expires_in: result.expiresIn
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/google/callback
   * Google OAuth callback
   */
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        throw new Error('Authorization code is required');
      }

      const result = await this.googleLoginUseCase.execute({ code });

      res.json(
        successResponse({
          user: {
            id: result.user.id,
            email: result.user.email.getValue(),
            name: result.user.name,
            avatar: result.user.avatar || null,
            bio: result.user.bio || null,
            location: result.user.location || null,
            role: result.user.role,
            created_at: result.user.createdAt
          },
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          expires_in: result.expiresIn
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new Error('Refresh token is required');
      }

      const result = await this.refreshTokenUseCase.execute({
        refreshToken: refresh_token
      });

      res.json(
        successResponse({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          expires_in: result.expiresIn
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      res.json(
        successResponse({
          id: user.id,
          email: user.email,
          name: user.name,
          joined_date: user.createdAt,
          role: user.role
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   * Logout current session
   */
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { refresh_token } = req.body;
      const accessToken = req.headers.authorization?.substring(7) || '';

      if (!refresh_token) {
        throw new Error('Refresh token is required');
      }

      await this.logoutUseCase.execute({
        userId,
        accessToken,
        refreshToken: refresh_token
      });

      res.json(successResponse(null, 'Logged out successfully'));
    } catch (error) {
      // Even if logout fails server-side, return success
      // Client should clear tokens regardless
      logger.error('Logout error:', error);
      res.json(successResponse(null, 'Logged out successfully'));
    }
  }

  /**
   * POST /auth/logout-all
   * Logout from all devices
   */
  async logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const accessToken = req.headers.authorization?.substring(7) || '';

      await this.logoutUseCase.logoutAll(userId, accessToken);

      res.json(successResponse(null, 'Logged out from all devices successfully'));
    } catch (error) {
      next(error);
    }
  }
}
