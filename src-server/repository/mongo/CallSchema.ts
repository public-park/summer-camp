import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Call } from '../../models/Call';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';

export interface CallDocument extends Document {
  _id: string;
  from: string;
  to: string;
  accountId: string;
  userId?: string;
  status: CallStatus;
  direction: CallDirection;
  createdAt: Date;
  duration?: number;
  callSid?: string;
  answeredAt?: Date;
  updatedAt?: Date | undefined;
  toCall: () => Call;
}

const CallSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    callSid: { type: String, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    accountId: { type: String, required: true, index: true, immutable: true },
    userId: { type: String, index: true },
    status: { type: String, required: true },
    direction: { type: String, required: true },
    duration: { type: Number },
    createdAt: { type: Date, default: Date.now, required: true },
    answeredAt: { type: Date },
    updatedAt: { type: Date },
  },
  { versionKey: false }
);

CallSchema.methods.toCall = function (): Call {
  const call = new Call(this.id, this.from, this.to, this.accountId, this.direction, this.status);

  call.createdAt = new Date(this.createdAt);

  if (this.userId) {
    call.userId = this.userId;
  }

  call.callSid = this.callSid ?? undefined;
  call.duration = this.duration ?? undefined;
  call.answeredAt = this.answeredAt ?? undefined;
  call.updatedAt = this.updatedAt ?? undefined;

  return call;
};

CallSchema.index({ callSid: 1 }, { unique: true, partialFilterExpression: { callSid: { $ne: null } } });

export const getModel = (COLLECTION_NAME: string) => {
  return mongoose.model<CallDocument>('CallModel', CallSchema, COLLECTION_NAME);
};
