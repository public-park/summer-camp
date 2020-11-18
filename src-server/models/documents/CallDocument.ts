import { CallDirection } from '../CallDirection';
import { CallStatus } from '../CallStatus';

export interface CallDocument {
  id: string;
  from: string;
  to: string;
  accountSid: string;
  userId: string | undefined;
  status: CallStatus | undefined;
  direction: CallDirection;
  createdAt: Date;
  duration?: number;
  callSid?: string | undefined;
  updatedAt?: Date;
  answeredAt?: Date;
}

export interface CallStatusDocument {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
  direction: CallDirection;
  answeredAt?: Date;
}
