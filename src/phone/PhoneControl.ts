import { Call } from './Call';
import { PhoneState } from './PhoneState';
import { User } from '../models/User';

export interface PhoneControl {
  call: Call | undefined;
  init: (token: string) => void;
  connect: (to: string) => Promise<Call>;
  getState: () => PhoneState;
  destroy: () => void;
  onStateChanged: (listener: (state: PhoneState) => void) => void;
  onError: (listener: (error: Error) => void) => void;
  onIncomingCall: (listener: (call: Call) => void) => void;
  onCallComplete: (listener: () => void) => void;
  onOutgoingCall: (listener: (call: Call) => void) => void;
  onConnectionEstablished: (listener: (call: Call) => void) => void;
  setInputDevice: (deviceId: string) => void;
  setOutputDevice: (deviceId: string) => Promise<void>;
  registerUser: (user: User) => void;
}
