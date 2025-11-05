import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { body, param } from 'express-validator';

export function createCommentRoutes(commentController: CommentController): Router {
  const router = Router();

  router.use(authMiddleware);

  // Get comments for a target
  router.get(
    '/:targetType/:targetId',
    validateRequest([param('targetType').isIn(['tree', 'fire']), param('targetId').isUUID()]),
    commentController.getComments.bind(commentController)
  );

  // Create a comment
  router.post(
    '/:targetType/:targetId',
    validateRequest([
      param('targetType').isIn(['tree', 'fire']),
      param('targetId').isUUID(),
      body('content').notEmpty().isString().isLength({ min: 1, max: 500 })
    ]),
    commentController.createComment.bind(commentController)
  );

  return router;
}
