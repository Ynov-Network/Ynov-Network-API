import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Assuming accounts also use UUIDs for their primary ID

export interface IAccount extends Document {
  _id: string; // was id
  account_id: string; // Assuming this is the provider's account ID
  provider_id: string; // e.g., 'google', 'github'
  user_id: string; // Ref to User._id
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  access_token_expires_at?: Date;
  refresh_token_expires_at?: Date;
  scope?: string;
  // password?: string; // This seems out of place for OAuth accounts, usually for credentials provider
  createdAt: Date;
  updatedAt: Date;
}

const AccountModel = new Schema<IAccount>({
  _id: { type: String, default: () => uuidv4() }, // Or keep it as 'id' if that's the convention from the auth lib
  account_id: { type: String, required: true }, // Provider's unique ID for this account
  provider_id: { type: String, required: true }, // Name of the provider
  user_id: { type: String, ref: 'User', required: true },
  access_token: { type: String },
  refresh_token: { type: String },
  id_token: { type: String }, // JWT
  access_token_expires_at: { type: Date },
  refresh_token_expires_at: { type: Date },
  scope: { type: String },
  // password: { type: String }, // If using a credentials provider style
}, {
  timestamps: true, // Handles createdAt, updatedAt
  _id: false, // if _id is explicitly defined as above
});

AccountModel.index({ provider_id: 1, account_id: 1 }, { unique: true }); // Common for OAuth accounts
AccountModel.index({ user_id: 1 });

export default mongoose.model<IAccount>('Account', AccountModel);