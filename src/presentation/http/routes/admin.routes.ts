import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { body } from 'express-validator';

export function createAdminRoutes(adminController: AdminController): Router {
  const router = Router();

  // All admin routes require authentication and admin role
  router.use(authMiddleware);
  router.use(adminMiddleware);

  // Update fire status
  router.patch(
    '/fires/:fireId/status',
    validateRequest([
      body('status')
        .isIn(['pending', 'investigating', 'resolved', 'false_alarm'])
        .withMessage('Invalid status'),
      body('notes').optional().isString()
    ]),
    adminController.updateFireStatus.bind(adminController)
  );

  // System statistics
  router.get('/stats', adminController.getSystemStats.bind(adminController));

  return router;
}
