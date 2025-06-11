import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Report extends Document {
  reporter_id: string;
  reported_entity_type: 'Post' | 'Comment' | 'User' | string;
  reported_entity_id: string;
  reported_entity_ref?: string;
  reason: string;
  status: 'pending' | 'resolved_action_taken' | 'resolved_no_action' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_timestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<Report, Model<Report>>({
  _id: { type: String, default: () => uuidv4() },
  reporter_id: { type: String, ref: 'User', required: true },
  reported_entity_type: { type: String, required: true, enum: ['Post', 'Comment', 'User'] },
  reported_entity_id: { type: String, required: true },
  reported_entity_ref: { type: String, refPath: 'reported_entity_type' },
  reason: { type: String, required: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'resolved_action_taken', 'resolved_no_action', 'dismissed'],
    default: 'pending',
    required: true,
  },
  admin_notes: { type: String },
  resolved_by: { type: String, ref: 'User', default: null },
  resolved_timestamp: { type: Date },
}, {
  timestamps: true,
  _id: false
});

reportSchema.index({ status: 1, timestamp: -1 });
reportSchema.index({ reported_entity_type: 1, reported_entity_id: 1 });

export default model<Report>('Report', reportSchema);