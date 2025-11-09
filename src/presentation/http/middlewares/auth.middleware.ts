import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '@application/interfaces/IAuthService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ITokenBlacklistService } from '@infrastructure/cache/TokenBlacklistService';
import { UnauthorizedError } from '@shared/errors';
import { logger } from '@shared/utils/logger';

export const createAuthMiddleware = (
  authService: IAuthService,
  userRepository: IUserRepository,
  blacklistService: ITokenBlacklistService
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token is missing');
      }

      const token = authHeader.substring(7);

      // 1. Check if token is blacklisted
      const isBlacklisted = await blacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        logger.warn('Attempted use of blacklisted token', {
          tokenPrefix: token.substring(0, 20)
        });
        throw new UnauthorizedError('Token has been revoked. Please log in again.');
      }

      // 2. Verify token signature and get payload
      const payload = await authService.verifyAccessToken(token);

      // 3. Fetch user from database
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        logger.warn('Token valid but user not found', { userId: payload.userId });
        throw new UnauthorizedError('User not found');
      }

      // 4. Check user status
      if (!user.isActive()) {
        logger.warn('Inactive user attempted access', {
          userId: user.id,
          status: user.status
        });
        throw new UnauthorizedError(`Account is ${user.status}. Please contact support.`);
      }

      // 5. Attach user to request
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

      logger.debug('Authentication successful', { userId: user.id });
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
