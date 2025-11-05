import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '@application/interfaces/IAuthService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UnauthorizedError } from '@shared/errors';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        avatar?: string;
        bio?: string;
        location?: string;
        createdAt: Date;
      };
    }
  }
}

export const createAuthMiddleware = (
  authService: IAuthService,
  userRepository: IUserRepository
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token is missing');
      }

      const token = authHeader.substring(7);
      const payload = await authService.verifyAccessToken(token);

      // Fetch user from database
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!user.isActive()) {
        throw new UnauthorizedError('User account is not active');
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export a placeholder for dependency injection
export let authMiddleware: ReturnType<typeof createAuthMiddleware>;

export const setAuthMiddleware = (middleware: ReturnType<typeof createAuthMiddleware>) => {
  authMiddleware = middleware;
};