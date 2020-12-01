import { Call } from '../models/Call';
import { PhoneState } from './PhoneState';

export interface PhoneControl {
  call: Call | undefined;
  init: (token: string) => void;
  connect: (to: string, from?: string) => Promise<Call>;
  getState: () => PhoneState;
  destroy: () => void;
  onStateChanged: (listener: (state: PhoneState) => void) => void;
  onCallStateChanged: (listener: (call: Call | undefined) => void) => void;
  onError: (listener: (error: Error) => void) => void;
  setInputDevice: (deviceId: string) => void;
  setOutputDevice: (deviceId: string) => Promise<void>;
}
