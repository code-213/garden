import { ICommentRepository } from '@domain/repositories/ICommentRepository';
import { Comment, CommentProps } from '@domain/entities/Comment';
import { CommentModel, ICommentDocument } from '../models/CommentModel';

export class CommentRepository implements ICommentRepository {
  async findById(id: string): Promise<Comment | null> {
    const doc = await CommentModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByTarget(targetType: 'tree' | 'fire', targetId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ targetType, targetId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ authorId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async save(comment: Comment): Promise<Comment> {
    const commentData = this.toPersistence(comment);
    const doc = new CommentModel(commentData);
    await doc.save();
    return this.toDomain(doc);
  }

  async update(comment: Comment): Promise<Comment> {
    const commentData = this.toPersistence(comment);
    const doc = await CommentModel.findByIdAndUpdate(comment.id, commentData, {
      new: true,
      runValidators: true
    });
    if (!doc) throw new Error('Comment not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await CommentModel.findByIdAndDelete(id);
  }

  private toDomain(doc: ICommentDocument): Comment {
    const props: CommentProps = {
      content: doc.content,
      authorId: doc.authorId,
      targetType: doc.targetType,
      targetId: doc.targetId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return Comment.create(props, doc._id.toString());
  }

  private toPersistence(comment: Comment): any {
    return {
      _id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      targetType: comment.targetType,
      targetId: comment.targetId
    };
  }
}
