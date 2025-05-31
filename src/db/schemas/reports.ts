import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IReport {
  reporter_user_id: string;
  reported_entity_type: 'Post' | 'Comment' | 'User' | string;
  reported_entity_id: string;
  reported_entity_ref?: string;
  reason: string;
  status: 'pending' | 'resolved_action_taken' | 'resolved_no_action' | 'dismissed';
  timestamp: Date;
  admin_notes?: string;
  resolved_by_user_id?: string;
  resolved_timestamp?: Date;
}

export interface IReportDocument extends IReport, Document { }

export interface IReportModel extends Model<IReportDocument> { }

const ReportModel = new Schema<IReportDocument, IReportModel>({
  _id: { type: String, default: () => uuidv4() },
  reporter_user_id: { type: String, ref: 'User', required: true },
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
  timestamp: { type: Date, default: Date.now, required: true },
  admin_notes: { type: String },
  resolved_by_user_id: { type: String, ref: 'User', default: null },
  resolved_timestamp: { type: Date },
}, {
  timestamps: true,
  _id: false
});

ReportModel.index({ status: 1, timestamp: -1 });
ReportModel.index({ reported_entity_type: 1, reported_entity_id: 1 });

export default mongoose.model<IReportDocument, IReportModel>('Report', ReportModel);