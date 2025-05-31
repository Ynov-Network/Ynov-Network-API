import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMedia {
  uploader_user_id: string; // Ref to User._id
  file_path: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  upload_timestamp: Date;
  cdn_url?: string;
}

export interface IMediaDocument extends IMedia, Document { }

export interface IMediaModel extends Model<IMediaDocument> { }

const MediaModel = new Schema<IMediaDocument, IMediaModel>({
  _id: { type: String, default: () => uuidv4() },
  uploader_user_id: { type: String, ref: 'User', required: true, index: true },
  file_path: { type: String, required: true },
  file_name: { type: String },
  file_type: { type: String },
  file_size: { type: Number },
  upload_timestamp: { type: Date, default: Date.now, required: true },
  cdn_url: { type: String },
}, {
  timestamps: true, // Add timestamps for media if useful (e.g., when record was last updated)
  _id: false
});

export default mongoose.model<IMediaDocument, IMediaModel>('Media', MediaModel);