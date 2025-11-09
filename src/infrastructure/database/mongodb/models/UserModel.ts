// src/infrastructure/database/mongodb/models/UserModel.ts
// UPDATE THIS FILE - Add password and emailVerified fields

import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  _id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  location?: string;
  googleId: string; // Empty string for email/password users
  password?: string; // Hashed password
  emailVerified?: boolean;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      maxlength: 500
    },
    avatar: {
      type: String
    },
    location: {
      type: String,
      maxlength: 100
    },
    googleId: {
      type: String,
      default: '',
      sparse: true // Allow multiple empty strings
    },
    password: {
      type: String,
      select: false // Don't include in queries by default for security
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index(
  { googleId: 1 },
  {
    unique: true,
    sparse: true, // Only enforce uniqueness for non-empty values
    partialFilterExpression: { googleId: { $ne: '' } }
  }
);
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ emailVerified: 1 });

// Pre-save hook to ensure data consistency
UserSchema.pre('save', function (next) {
  // Ensure at least one auth method exists
  if (!this.googleId && !this.password) {
    return next(new Error('User must have either googleId or password'));
  }

  // Google users should have emailVerified = true
  if (this.googleId && this.googleId !== '') {
    this.emailVerified = true;
  }

  next();
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
