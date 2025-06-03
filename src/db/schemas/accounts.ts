import { type Model, model, Schema, type Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Account extends Document {
  user_id: string; 
  account_id: string; 
  provider_id: string; 
  access_token?: string;
  refresh_token?: string;
  access_token_expires_at?: Date;
  refresh_token_expires_at?: Date;
  scope?: string;
  id_token?: string;
  password?: string;
}

const AccountModel = new Schema<Account, Model<Comment>>({
  _id: { type: String, default: () => uuidv4() }, 
  account_id: { type: String, required: true },
  provider_id: { type: String, required: true },
  user_id: { type: String, ref: 'User', required: true },
  access_token: { type: String },
  refresh_token: { type: String },
  id_token: { type: String }, 
  access_token_expires_at: { type: Date },
  refresh_token_expires_at: { type: Date },
  scope: { type: String },
  password: { type: String }, 
}, {
  timestamps: true, 
  _id: false,
});

AccountModel.index({ provider_id: 1, account_id: 1 }, { unique: true });
AccountModel.index({ user_id: 1 });

export default model<Account>('Account', AccountModel);