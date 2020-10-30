import { CallDirection } from './CallDirection';
import { CallStatus } from './CallStatus';
import { User } from './User';

export interface Call {
  id: string;
  user: User;
  from: string;
  to: string;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  isRecording: boolean;
  direction: CallDirection;
  status: CallStatus;
  createdAt: Date;
  answeredAt: Date | undefined;
  answer: () => Promise<void>;
  end: () => Promise<void>;
  reject: () => Promise<void>;
  mute: (state: boolean) => Promise<void>;
  hold: (state: boolean) => Promise<void>;
  record: (state: boolean) => Promise<void>;
  sendDigits: (digits: string) => void;
  onAnswer: (listener: () => void) => void;
  registerConnection: (connection: any) => void;
}
