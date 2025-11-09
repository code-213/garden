// src/presentation/http/routes/auth.routes.ts
// UPDATE THIS FILE - Add register and login routes

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { authRateLimit } from '../middlewares/rateLimit.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  logoutValidator
} from '../validators/auth.validator';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Public routes

  // Register with email/password
  router.post(
    '/register',
    authRateLimit, // Rate limiting to prevent abuse
    validateRequest(registerValidator),
    authController.register.bind(authController)
  );

  // Login with email/password
  router.post(
    '/login',
    authRateLimit, // Rate limiting to prevent brute force
    validateRequest(loginValidator),
    authController.login.bind(authController)
  );

  // Google OAuth callback
  router.get('/google/callback', authController.googleCallback.bind(authController));

  // Refresh access token
  router.post(
    '/refresh',
    validateRequest(refreshTokenValidator),
    authController.refreshToken.bind(authController)
  );

  // Protected routes (require authentication)

  // Get current user info
  router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));

  // Logout current session
  router.post(
    '/logout',
    authMiddleware,
    validateRequest(logoutValidator),
    authController.logout.bind(authController)
  );

  // Logout from all devices
  router.post('/logout-all', authMiddleware, authController.logoutAll.bind(authController));

  return router;
}
