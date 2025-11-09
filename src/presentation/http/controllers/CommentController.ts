import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@shared/utils/response';
import { ICommentRepository } from '@domain/repositories/ICommentRepository';
import { Comment, CommentProps } from '@domain/entities/Comment';
import { ValidationError, NotFoundError } from '@shared/errors';

export class CommentController {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetType, targetId } = req.params;

      if (!['tree', 'fire'].includes(targetType)) {
        throw new ValidationError('Invalid target type');
      }

      const comments = await this.commentRepository.findByTarget(
        targetType as 'tree' | 'fire',
        targetId
      );

      res.json(
        successResponse({
          comments: comments.map(c => ({
            id: c.id,
            content: c.content,
            authorId: c.authorId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          })),
          total: comments.length
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

      if (!['tree', 'fire'].includes(targetType)) {
        throw new ValidationError('Invalid target type');
      }

      const commentProps: CommentProps = {
        content: content.trim(),
        authorId: userId,
        targetType: targetType as 'tree' | 'fire',
        targetId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const comment = Comment.create(commentProps);
      const savedComment = await this.commentRepository.save(comment);

      res.status(201).json(
        successResponse(
          {
            id: savedComment.id,
            content: savedComment.content,
            authorId: savedComment.authorId,
            targetType: savedComment.targetType,
            targetId: savedComment.targetId,
            createdAt: savedComment.createdAt
          },
          'Comment created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user!.id;

      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comment not found');
      }

      if (comment.authorId !== userId) {
        throw new ValidationError('You can only update your own comments');
      }

      comment.updateContent(content);
      const updatedComment = await this.commentRepository.update(comment);

      res.json(successResponse(updatedComment, 'Comment updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';

      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comment not found');
      }

      if (!isAdmin && comment.authorId !== userId) {
        throw new ValidationError('You can only delete your own comments');
      }

      await this.commentRepository.delete(commentId);
      res.json(successResponse(null, 'Comment deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
