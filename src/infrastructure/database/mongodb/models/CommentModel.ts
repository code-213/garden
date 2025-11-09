import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
  _id: string;
  content: string;
  authorId: string;
  targetType: 'tree' | 'fire';
  targetId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    content: { type: String, required: true },
    authorId: { type: String, required: true, ref: 'User' },
    targetType: { type: String, enum: ['tree', 'fire'], required: true },
    targetId: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: 'comments'
  }
);

CommentSchema.index({ targetType: 1, targetId: 1 });
CommentSchema.index({ authorId: 1 });

export const CommentModel = mongoose.model<ICommentDocument>('Comment', CommentSchema);
