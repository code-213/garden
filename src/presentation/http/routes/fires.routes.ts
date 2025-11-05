import { Router } from 'express';
import { FireController } from '../controllers/FireController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { reportFireValidator } from '../validators/fire.validator';

export function createFireRoutes(fireController: FireController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', fireController.getFires.bind(fireController));

  router.post(
    '/',
    validateRequest(reportFireValidator),
    fireController.reportFire.bind(fireController)
  );

  return router;
}
