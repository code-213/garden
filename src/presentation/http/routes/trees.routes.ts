import { Router } from 'express';
import { TreeController } from '../controllers/TreeController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { plantTreeValidator, waterTreeValidator } from '../validators/tree.validator';

export function createTreeRoutes(treeController: TreeController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // GET /trees - Get all trees
  router.get('/', treeController.getTrees.bind(treeController));

  // POST /trees - Plant a new tree
  router.post(
    '/',
    validateRequest(plantTreeValidator),
    treeController.plantTree.bind(treeController)
  );

  // POST /trees/:treeId/water - Water a tree
  router.post(
    '/:treeId/water',
    validateRequest(waterTreeValidator),
    treeController.waterTree.bind(treeController)
  );

  return router;
}
