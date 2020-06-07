import { CallStatus } from './CallStatus';
import { CallDirection } from './CallDirection';

export class Call {
  id: string;
  callSid: string;
  from: string;
  to: string;
  accountId: string;
  userId: string | undefined;
  status: CallStatus;
  direction: CallDirection;
  duration: number | undefined;
  createdAt: Date;
  updatedAt: Date | undefined;

  constructor(
    id: string,
    callSid: string,
    from: string,
    to: string,
    accountId: string,
    userId: string | undefined,
    status: CallStatus,
    direction: CallDirection,
    createdAt: Date = new Date(),
    duration?: number,
    updatedAt?: Date
  ) {
    this.id = id;
    this.callSid = callSid;
    this.from = from;
    this.to = to;
    this.accountId = accountId;
    this.userId = userId;
    this.status = status;
    this.direction = direction;
    this.duration = duration;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toApiResponse(): any {
    const payload: any = {
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

    return payload;
  }
}
