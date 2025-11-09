// src/infrastructure/database/mongodb/models/RefreshTokenModel.ts
// CREATE NEW FILE

import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  _id: string;
  token: string;
  userId: string;
  familyId: string;
  expiresAt: Date;
  isUsed: boolean;
  isRevoked: boolean;
  replacedBy?: string;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true
    },
    familyId: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    replacedBy: {
      type: String
    },
    deviceInfo: {
      userAgent: { type: String },
      ipAddress: { type: String }
    }
  },
  {
    timestamps: true,
    collection: 'refresh_tokens'
  }
);

// Compound indexes for common queries
RefreshTokenSchema.index({ userId: 1, familyId: 1 });
RefreshTokenSchema.index({ userId: 1, isRevoked: 1, isUsed: 1 });
RefreshTokenSchema.index({ familyId: 1, isRevoked: 1 });

// TTL index - automatically delete expired tokens after 30 days
RefreshTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days after expiration
  }
);

export const RefreshTokenModel = mongoose.model<IRefreshTokenDocument>(
  'RefreshToken',
  RefreshTokenSchema
);
