import * as mongoose from 'mongoose';

import { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Call } from '../../models/Call';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';

export interface CallDocument extends Document {
  _id: string;
  callSid: string;
  from: string;
  to: string;
  accountId: string;
  userId: string;
  status: CallStatus;
  direction: CallDirection;
  duration: number | undefined;
  createdAt: Date;
  answeredAt: Date | undefined;
  updatedAt: Date | undefined;
  toCall: () => Call;
}

const CallSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    callSid: { type: String, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    status: { type: String },
    direction: { type: String, required: true },
    duration: { type: Number },
    createdAt: { type: Date, default: Date.now, required: true },
    answeredAt: { type: Date },
    updatedAt: { type: Date },
  },
  { versionKey: false, collection: 'calls' }
);

CallSchema.methods.toCall = function (): Call {
  return new Call(
    this._id,
    this.callSid,
    this.from,
    this.to,
    this.accountId,
    this.userId,
    this.status,
    this.direction,
    this.createdAt,
    this.duration === null ? undefined : this.duration,
    this.answeredAt === null ? undefined : this.answeredAt,
    this.updatedAt === null ? undefined : this.updatedAt
  );
};

CallSchema.index({ callSid: 1 }, { unique: true, partialFilterExpression: { callSid: { $ne: null } } });

const CallModel = mongoose.model<CallDocument>('CallModel', CallSchema);

export default CallModel;
