export interface Call {
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
  hold: () => Promise<void>;
  sendDigits: (digits: string) => void;
  onConnectionStateChange: (listener: (state: boolean) => void) => void;
}

export type CallDirection = 'inbound' | 'outbound';
