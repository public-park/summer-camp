import { CallDirection } from '../CallDirection';
import { CallStatus } from '../CallStatus';

export interface CallDocument {
  id: string;
  from: string;
  to: string;
  accountId: string;
  userId?: string;
  status: CallStatus;
  direction: CallDirection;
  createdAt: string;
  duration?: number;
  callSid?: string;
  updatedAt?: string;
  answeredAt?: string;
}

export interface CallStatusDocument {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
  direction: CallDirection;
  answeredAt?: string;
}
