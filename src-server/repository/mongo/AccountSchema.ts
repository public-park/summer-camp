import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { Account } from '../../models/Account';
import { v4 as uuidv4 } from 'uuid';
import { AccountConfiguration } from '../../models/AccountConfiguration';

export interface AccountDocument extends Document {
  _id: string;
  name: string;
  configuration: AccountConfiguration | undefined;
  createdAt: Date;
  toAccount: () => Account;
}

const AccountSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    configuration: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { versionKey: false }
);

AccountSchema.methods.toAccount = function (): Account {
  return new Account(this._id, this.name, this.configuration, this.createdAt);
};

export const getModel = (COLLECTION_NAME: string) => {
  return mongoose.model<AccountDocument>('AccountModel', AccountSchema, COLLECTION_NAME);
};
