import { User } from '../models/User';

export interface Call {
  id: string;
  user: User;
  phoneNumber: string;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  direction: CallDirection;
  createdAt: Date;
  answeredAt: Date | undefined;
  answer: () => Promise<void>;
  end: () => Promise<void>;
  reject: () => Promise<void>;
  mute: (state: boolean) => Promise<void>;
  hold: (state: boolean) => Promise<void>;
  sendDigits: (digits: string) => void;
  onConnectionStateChange: (listener: (state: boolean) => void) => void;
}

export enum CallDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export enum CallStatus {
  Initiated = 'initiated',
  Ringing = 'ringing',
  NoAnswer = 'no-answer',
  InProgress = 'in-progress',
  Completed = 'completed',
  Busy = 'busy',
  Failed = 'failed',
  Canceled = 'canceled',
  Queued = 'queued',
}
