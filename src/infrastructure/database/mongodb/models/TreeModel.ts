import mongoose, { Schema, Document } from 'mongoose';

export interface ITreeDocument extends Document {
  species: string;
  plantedBy: string;
  plantedDate: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'healthy' | 'needs_water' | 'at_risk';
  height?: number;
  waterCount: number;
  lastWatered?: Date;
  image?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TreeSchema = new Schema<ITreeDocument>(
  {
    species: { type: String, required: true },
    plantedBy: { type: String, required: true, ref: 'User' },
    plantedDate: { type: Date, required: true, default: Date.now },
    location: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
      address: { type: String }
    },
    status: {
      type: String,
      enum: ['healthy', 'needs_water', 'at_risk'],
      default: 'healthy'
    },
    height: { type: Number, min: 0 },
    waterCount: { type: Number, default: 0, min: 0 },
    lastWatered: { type: Date },
    image: { type: String },
    notes: { type: String }
  },
  {
    timestamps: true,
    collection: 'trees'
  }
);

// Indexes
TreeSchema.index({ plantedBy: 1 });
TreeSchema.index({ status: 1 });
TreeSchema.index({ species: 1 });
TreeSchema.index({ 'location.lat': 1, 'location.lng': 1 });
TreeSchema.index({ plantedDate: -1 });

export const TreeModel = mongoose.model<ITreeDocument>('Tree', TreeSchema);
