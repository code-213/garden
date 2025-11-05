import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { refreshTokenValidator } from '../validators/auth.validator';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Public routes
  router.get('/google/callback', authController.googleCallback.bind(authController));
  
  router.post(
    '/refresh',
    validateRequest(refreshTokenValidator),
    authController.refreshToken.bind(authController)
  );

  // Protected routes
  router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));
  router.post('/logout', authMiddleware, authController.logout.bind(authController));

  return router;
}
