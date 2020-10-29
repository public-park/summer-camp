import { CallStatus } from './CallStatus';
import { CallDirection } from './CallDirection';
import { CallDocument, CallStatusDocument } from './documents/CallDocument';

export class Call {
  id: string;
  callSid: string | undefined;
  from: string;
  to: string;
  accountId: string;
  userId: string | undefined;
  status: CallStatus;
  direction: CallDirection;
  duration: number | undefined;
  createdAt: Date;
  answeredAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(
    id: string,
    callSid: string | undefined,
    from: string,
    to: string,
    accountId: string,
    userId: string | undefined,
    status: CallStatus,
    direction: CallDirection,
    createdAt: Date = new Date(),
    duration: number | undefined = undefined,
    answeredAt: Date | undefined = undefined,
    updatedAt: Date | undefined = undefined
  ) {
    this.id = id;
    this.callSid = callSid;
    this.from = from;
    this.to = to;
    this.accountId = accountId;
    this.userId = userId;
    this.status = status;
    this.direction = direction;
    this.createdAt = createdAt;
    this.duration = duration;
    this.answeredAt = answeredAt;
    this.updatedAt = updatedAt;
  }

  isActive(): boolean {
    return [CallStatus.InProgress, CallStatus.Initiated, CallStatus.Queued, CallStatus.Ringing].includes(this.status);
  }

  toDocument(): CallDocument {
    const payload: CallDocument = {
      id: this.id,
      callSid: this.callSid,
      from: this.from,
      to: this.to,
      accountSid: this.accountId,
      userId: this.userId,
      status: this.status,
      direction: this.direction,
      createdAt: this.createdAt,
    };

    if (this.duration) {
      payload.duration = this.duration;
    }

    if (this.updatedAt) {
      payload.updatedAt = this.updatedAt;
    }

    if (this.answeredAt) {
      payload.answeredAt = this.answeredAt;
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
      payload.answeredAt = this.answeredAt;
    }
    return payload;
  }
}
