import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Media extends Document {
  _id: Types.ObjectId;
  uploader_id: Types.ObjectId;
  file_path: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  cdn_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<Media, Model<Media>>({
  uploader_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  file_path: { type: String, required: true },
  file_name: { type: String },
  file_type: { type: String },
  file_size: { type: Number },
  cdn_url: { type: String },
}, {
  timestamps: true,
});

export default model<Media>('Media', mediaSchema);