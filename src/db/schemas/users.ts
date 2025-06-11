import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface User extends Document {
  university_email: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string;
  bio?: string;
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
}

const userSchema = new Schema<User, Model<User>>({
  _id: { type: String, default: () => uuidv4() },
  university_email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  first_name: { type: String, trim: true, maxlength: 50 },
  last_name: { type: String, trim: true, maxlength: 50 },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  country: { type: String, trim: true, maxlength: 50 },
  city: { type: String, trim: true, maxlength: 50 },
  profile_picture_url: { type: String },
  bio: { type: String, maxlength: 160 },
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
}, {
  timestamps: true,
  _id: false
});

export default model<User>('User', userSchema);