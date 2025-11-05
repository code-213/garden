import { Comment } from '../entities/Comment';

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByTarget(targetType: 'tree' | 'fire', targetId: string): Promise<Comment[]>;
  findByAuthor(authorId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<Comment>;
  update(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
}
