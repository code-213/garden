import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { updateUserValidator } from '../validators/user.validator';

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/:userId', userController.getProfile.bind(userController));

  router.put(
    '/:userId',
    validateRequest(updateUserValidator),
    userController.updateProfile.bind(userController)
  );

  return router;
}
