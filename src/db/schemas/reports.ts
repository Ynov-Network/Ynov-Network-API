import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Report extends Document {
  _id: Types.ObjectId;
  reporter_id: Types.ObjectId;
  reported_entity_type: 'Post' | 'Comment' | 'User' | string;
  reported_entity_id: string;
  reported_entity_ref?: Types.ObjectId;
  reason: string;
  status: 'pending' | 'resolved_action_taken' | 'resolved_no_action' | 'dismissed';
  admin_notes?: string;
  resolved_by?: Types.ObjectId;
  resolved_timestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<Report, Model<Report>>({
  reporter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reported_entity_type: { type: String, required: true, enum: ['Post', 'Comment', 'User'] },
  reported_entity_id: { type: String, required: true },
  reported_entity_ref: { type: Schema.Types.ObjectId, refPath: 'reported_entity_type' },
  reason: { type: String, required: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'resolved_action_taken', 'resolved_no_action', 'dismissed'],
    default: 'pending',
    required: true,
  },
  admin_notes: { type: String },
  resolved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  resolved_timestamp: { type: Date },
}, {
  timestamps: true,
});

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reported_entity_type: 1, reported_entity_id: 1 });

export default model<Report>('Report', reportSchema);