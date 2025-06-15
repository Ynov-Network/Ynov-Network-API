import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Group extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  topic: 'Web Development' | 'AI' | 'CyberSecurity' | 'Data Analytics' | 'Games Development';
  creator_id: Types.ObjectId; // Ref to User._id
  members: Types.ObjectId[]; // Array of User._id
  conversation_id: Types.ObjectId; // Ref to Conversation._id
  is_public: boolean;
  cover_image_url?: string;
  createdAt: Date;
  updatedAt: Date;
  post_count: number;
}

const groupSchema = new Schema<Group, Model<Group>>({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  topic: {
    type: String,
    enum: ['Web Development', 'AI', 'CyberSecurity', 'Data Analytics', 'Games Development'],
    required: true,
  },
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, unique: true },
  is_public: { type: Boolean, default: true },
  cover_image_url: { type: String },
  post_count: { type: Number, default: 0 },
}, {
  timestamps: true,
});

groupSchema.index({ topic: 1 });

export default model<Group>('Group', groupSchema); 