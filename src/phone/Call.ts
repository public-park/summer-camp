export interface Call {
  phoneNumber: string;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  direction: CallDirection;
  answer: () => Promise<void>;
  end: () => Promise<void>;
  reject: () => Promise<void>;
  mute: (state: boolean) => Promise<void>;
  hold: () => Promise<void>;
  sendDigits: (digits: string) => void;
  onConnectionStateChange: (listener: (state: boolean) => void) => void;
}

export type CallDirection = 'INBOUND' | 'OUTBOUND';
