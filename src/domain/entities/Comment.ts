import { Entity } from './base/Entity';

export interface CommentProps {
  content: string;
  authorId: string;
  targetType: 'tree' | 'fire';
  targetId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment extends Entity<CommentProps> {
  private constructor(props: CommentProps, id?: string) {
    super(props, id);
  }

  public static create(props: CommentProps, id?: string): Comment {
    return new Comment(props, id);
  }

  get content(): string {
    return this.props.content;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get targetType(): 'tree' | 'fire' {
    return this.props.targetType;
  }

  get targetId(): string {
    return this.props.targetId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }
    this.props.content = content.trim();
    this.props.updatedAt = new Date();
  }
}
