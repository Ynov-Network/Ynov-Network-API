import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Media extends Document {
  uploader_id: string;
  file_path: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  upload_timestamp: Date;
  cdn_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<Media, Model<Media>>({
  _id: { type: String, default: () => uuidv4() },
  uploader_id: { type: String, ref: 'User', required: true, index: true },
  file_path: { type: String, required: true },
  file_name: { type: String },
  file_type: { type: String },
  file_size: { type: Number },
  cdn_url: { type: String },
}, {
  timestamps: true,
  _id: false
});

export default model<Media>('Media', mediaSchema);