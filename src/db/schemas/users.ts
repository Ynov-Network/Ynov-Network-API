import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// 1. Base Interface (raw properties)
export interface IUser {
  university_email: string;
  password_hash: string;
  username: string;
  profile_picture_url?: string;
  bio?: string;
  date_joined: Date;
  last_login?: Date;
  privacy_settings?: any;
  is_verified: boolean;
  role: 'student' | 'admin';
  follower_count: number;
  following_count: number;
  post_count: number;
  two_factor_enabled: boolean;
  banned: boolean;
  ban_reason?: string;
  ban_expires?: Date;
  // createdAt and updatedAt will be part of Document
}

// 2. Document Interface (extends base + Document, adds instance methods if any)
export interface IUserDocument extends IUser, Document {}

// 3. Model Interface (extends Model<DocumentInterface>, adds static methods if any)
export interface IUserModel extends Model<IUserDocument> {
  // Example static method:
  // findByUsername(username: string): Promise<IUserDocument | null>;
}

const UserModel = new Schema<IUserDocument, IUserModel>({
  _id: { type: String, default: () => uuidv4() },
  university_email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password_hash: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  profile_picture_url: { type: String },
  bio: { type: String, maxlength: 160 },
  date_joined: { type: Date, default: Date.now },
  last_login: { type: Date },
  privacy_settings: { type: Schema.Types.Mixed },
  is_verified: { type: Boolean, default: false, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
  follower_count: { type: Number, default: 0, min: 0, required: true },
  following_count: { type: Number, default: 0, min: 0, required: true },
  post_count: { type: Number, default: 0, min: 0, required: true },
  two_factor_enabled: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  ban_reason: { type: String },
  ban_expires: { type: Date },
}, {
  timestamps: true,
  _id: false
});

UserModel.index({ university_email: 1 });
UserModel.index({ username: 1 });

// Define statics here if you have them:
// UserModel.statics.findByUsername = function(username: string) {
//   return this.findOne({ username });
// };

export default mongoose.model<IUserDocument, IUserModel>('User', UserModel);