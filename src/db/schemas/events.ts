import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Event extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  event_type: 'Workshop' | 'Competition' | 'Bootcamp' | 'Seminar' | 'Social';
  creator_id: Types.ObjectId; // Ref to User._id
  start_date: Date;
  end_date: Date;
  location: string;
  participants: Types.ObjectId[]; // Array of User._id
  participant_limit?: number;
  cover_image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<Event, Model<Event>>({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  event_type: {
    type: String,
    enum: ['Workshop', 'Competition', 'Bootcamp', 'Seminar', 'Social'],
    required: true,
  },
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  location: { type: String, required: true, maxlength: 200 },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  participant_limit: { type: Number, min: 1 },
  cover_image_url: { type: String },
}, {
  timestamps: true,
});

eventSchema.index({ start_date: 1 });
eventSchema.index({ event_type: 1 });

export default model<Event>('Event', eventSchema); 