import * as mongoose from 'mongoose';

import { Document, Schema } from 'mongoose';
import { User, UserAuthentication } from '../../models/User';
import { v4 as uuidv4 } from 'uuid';
import { UserActivity } from '../../models/UserActivity';
import { UserRole } from '../../models/UserRole';

export interface UserDocument extends Document {
  _id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  role: UserRole;
  createdAt: Date;
  toUser: () => User;
}

const UserSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, unique: true, index: true },
    profileImageUrl: { type: String, required: false },
    tags: [String],
    activity: { type: String, required: true, index: true },
    accountId: { type: String, required: true },
    authentication: Schema.Types.Mixed,
    role: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false, collection: 'users' }
);

UserSchema.methods.toUser = function (): User {
  return new User(
    this._id,
    this.name,
    this.profileImageUrl,
    new Set(this.tags),
    this.activity,
    this.accountId,
    this.authentication,
    this.role,
    this.createdAt
  );
};

const UserModel = mongoose.model<UserDocument>('UserModel', UserSchema);

export default UserModel;
