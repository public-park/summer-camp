import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { User } from '../../models/User';
import { v4 as uuidv4 } from 'uuid';
import { UserActivity } from '../../models/UserActivity';
import { UserRole } from '../../models/UserRole';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { UserConfiguration } from '../../models/UserConfiguration';

export interface UserDocument extends Document {
  _id: string;
  name: string;
  profileImageUrl?: string;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  configuration?: UserConfiguration;
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
    accountId: { type: String, required: true, immutable: true },
    authentication: Schema.Types.Mixed,
    role: { type: String, required: true },
    configuration: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false }
);

UserSchema.methods.toUser = function (): User {
  return new User(
    this._id,
    this.name,
    this.profileImageUrl ? this.profileImageUrl : undefined,
    new Set(this.tags),
    this.activity,
    this.accountId,
    this.authentication,
    this.role,
    this.configuration,
    this.createdAt
  );
};

export const getModel = (COLLECTION_NAME: string) => {
  return mongoose.model<UserDocument>('UserModel', UserSchema, COLLECTION_NAME);
};
