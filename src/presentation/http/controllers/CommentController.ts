import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@shared/utils/response';

export class CommentController {
  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetType, targetId } = req.params;

      // Implementation would fetch comments
      res.json(
        successResponse({
          comments: [],
          total: 0
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetType, targetId } = req.params;
      const { content } = req.body;
      const userId = req.user!.id;

      // Implementation would create comment
      res.status(201).json(successResponse(null, 'Comment created successfully'));
    } catch (error) {
      next(error);
    }
  }
}
