import { Call } from './Call';
import { PhoneState } from './PhoneState';

export interface PhoneControl {
  init: (token: string) => void;
  call: (phoneNumber: string) => Call;
  getState: () => PhoneState;
  destroy: () => void;
  onStateChanged: (listener: (state: PhoneState) => void) => void;
  onError: (listener: (error: Error) => void) => void;
  onIncomingCall: (listener: (call: Call) => void) => void;
  onOutgoingCall: (listener: (call: Call) => void) => void;
}
