import { Schema, model, type Document, type Model, type Types } from 'mongoose';

export interface User extends Document {
  _id: Types.ObjectId;
  university_email: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string;
  bio?: string;
  phone_number?: string;
  date_joined: Date;
  last_login?: Date;
  privacy_settings?: unknown;
  email_verified: boolean;
  role: 'student' | 'admin';
  follower_count: number;
  country?: string;
  city?: string;
  following_count: number;
  post_count: number;
  two_factor_enabled: boolean;
  banned: boolean;
  ban_reason?: string;
  ban_expires?: Date;
  account_privacy: 'public' | 'private' | 'followers_only';
  show_online_status: boolean;
  allow_message_requests: 'everyone' | 'following' | 'none';
  notification_settings: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
    posts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User, Model<User>>({
  university_email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  first_name: { type: String, trim: true, maxlength: 50 },
  last_name: { type: String, trim: true, maxlength: 50 },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  country: { type: String, trim: true, maxlength: 50 },
  city: { type: String, trim: true, maxlength: 50 },
  profile_picture_url: { type: String },
  bio: { type: String, maxlength: 160 },
  phone_number: { type: String, trim: true, maxlength: 15 },
  date_joined: { type: Date, default: Date.now },
  last_login: { type: Date },
  privacy_settings: { type: Schema.Types.Mixed },
  email_verified: { type: Boolean, default: false, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
  follower_count: { type: Number, default: 0, min: 0, required: true },
  following_count: { type: Number, default: 0, min: 0, required: true },
  post_count: { type: Number, default: 0, min: 0, required: true },
  two_factor_enabled: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  ban_reason: { type: String },
  ban_expires: { type: Date },
  account_privacy: { type: String, enum: ['public', 'private', 'followers_only'], default: 'public' },
  show_online_status: { type: Boolean, default: true },
  allow_message_requests: { type: String, enum: ['everyone', 'following', 'none'], default: 'everyone' },
  notification_settings: {
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    posts: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

export default model<User>('User', userSchema);