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
    // Remove 'unique: true' from here since we're adding indexes separately
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String },
    location: { type: String },
    // Remove 'unique: true' from here since we're adding indexes separately
    googleId: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes - unique indexes are defined here only
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { unique: true });
UserSchema.index({ status: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
