import { CallStatus } from './CallStatus';
import { CallDirection } from './CallDirection';
import { CallDocument, CallStatusDocument } from './documents/CallDocument';
import { User } from './User';

export class Call {
  id: string;
  from: string;
  to: string;
  accountId: string;
  status: CallStatus;
  direction: CallDirection;
  userId: string | undefined;
  duration: number | undefined;
  transfer: { from: string; to: string } | undefined;
  callSid: string | undefined;
  createdAt: Date;
  answeredAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(
    id: string,
    from: string,
    to: string,
    accountId: string,
    direction: CallDirection,
    status: CallStatus,
    user?: User,
    callSid?: string
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.accountId = accountId;
    this.direction = direction;
    this.status = status;
    this.userId = user?.id;
    this.callSid = callSid;
    this.createdAt = new Date();
  }

  isActive(): boolean {
    return [
      CallStatus.Transfer,
      CallStatus.InProgress,
      CallStatus.Initiated,
      CallStatus.Queued,
      CallStatus.Ringing,
    ].includes(this.status);
  }

  toDocument(): CallDocument {
    const payload: CallDocument = {
      id: this.id,
      from: this.from,
      to: this.to,
      accountId: this.accountId,
      status: this.status,
      direction: this.direction,
      createdAt: this.createdAt.toUTCString(),
    };

    if (this.userId) {
      payload.userId = this.userId;
    }

    if (this.duration) {
      payload.duration = this.duration;
    }

    if (this.callSid) {
      payload.callSid = this.callSid;
    }

    if (this.updatedAt) {
      payload.updatedAt = this.updatedAt.toUTCString();
    }

    if (this.answeredAt) {
      payload.answeredAt = this.answeredAt.toUTCString();
    }

    return payload;
  }

  toStatusDocument(): CallStatusDocument {
    const payload: CallStatusDocument = {
      id: this.id,
      from: this.from,
      to: this.to,
      status: this.status,
      direction: this.direction,
    };

    if (this.answeredAt) {
      payload.answeredAt = this.answeredAt.toUTCString();
    }
    return payload;
  }
}
