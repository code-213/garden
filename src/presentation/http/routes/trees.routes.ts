import { Router } from 'express';
import { TreeController } from '../controllers/TreeController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { plantTreeValidator, waterTreeValidator } from '../validators/tree.validator';
import { plantTreeRateLimit } from '../middlewares/rateLimit.middleware'; // ✅ Import

export function createTreeRoutes(treeController: TreeController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', treeController.getTrees.bind(treeController));

  // ✅ Add rate limiting
  router.post(
    '/',
    plantTreeRateLimit, // ✅ Add this middleware
    validateRequest(plantTreeValidator),
    treeController.plantTree.bind(treeController)
  );

  router.post(
    '/:treeId/water',
    validateRequest(waterTreeValidator),
    treeController.waterTree.bind(treeController)
  );

  return router;
}
