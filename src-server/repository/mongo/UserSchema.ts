import * as mongoose from 'mongoose';

import { Document, Schema, Model } from 'mongoose';
import { User, UserAuthentication } from '../../models/User';
import { v4 as uuidv4 } from 'uuid';
import { UserActivity } from '../../models/UserActivity';

export interface UserDocument extends Document {
  _id: string;
  name: string;
  profileUrl: string | undefined;
  labels: Array<string>;
  activity: UserActivity;
  accountId: string;
  permissions: Array<string>;
  authentication: UserAuthentication;
  createdAt: Date;
  toUser: () => User;
}

const UserSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, unique: true },
    profileUrl: { type: String, required: false },
    labels: [String],
    activity: { type: String, required: true },
    accountId: { type: String, required: true },
    permissions: [String],
    authentication: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false, collection: 'users' }
);

UserSchema.methods.toUser = function (): User {
  return new User(
    this._id,
    this.name,
    this.profileUrl,
    new Set(this.labels),
    this.activity,
    this.accountId,
    new Set(this.permissions),
    this.authentication,
    this.createdAt
  );
};

const UserModel = mongoose.model<UserDocument>('UserModel', UserSchema);

export default UserModel;
