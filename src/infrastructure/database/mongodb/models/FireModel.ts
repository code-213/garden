import mongoose, { Schema, Document } from 'mongoose';

export interface IFireDocument extends Document {
  reportedBy: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'false_alarm';
  description: string;
  reportedDate: Date;
  updatedDate: Date;
  images: string[];
  affectedAreaSqm?: number;
  responseTeam?: string;
  resolvedDate?: Date;
  notes?: string;
}

const FireSchema = new Schema<IFireDocument>(
  {
    reportedBy: { type: String, required: true, ref: 'User' },
    location: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
      address: { type: String }
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'false_alarm'],
      default: 'pending'
    },
    description: { type: String, required: true },
    reportedDate: { type: Date, required: true, default: Date.now },
    updatedDate: { type: Date, required: true, default: Date.now },
    images: [{ type: String }],
    affectedAreaSqm: { type: Number, min: 0 },
    responseTeam: { type: String },
    resolvedDate: { type: Date },
    notes: { type: String }
  },
  {
    collection: 'fires'
  }
);

// Indexes
FireSchema.index({ reportedBy: 1 });
FireSchema.index({ status: 1 });
FireSchema.index({ severity: 1 });
FireSchema.index({ 'location.lat': 1, 'location.lng': 1 });
FireSchema.index({ reportedDate: -1 });

export const FireModel = mongoose.model<IFireDocument>('Fire', FireSchema);
