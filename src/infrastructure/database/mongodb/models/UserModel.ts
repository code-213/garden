import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  _id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  location?: string;
  googleId: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String },
    location: { type: String },
    googleId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ status: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
