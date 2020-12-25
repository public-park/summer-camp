import { CallStatusDocument } from '../models/documents/CallDocument';
import { UserConfiguration } from '../models/UserConfiguration';
import { PhoneState } from '../phone/PhoneState';

export interface PhoneStore {
  userId: string | undefined;
  state: PhoneState;
  token: string | undefined;
  configuration: UserConfiguration | undefined;
  error: string | undefined;
  display: {
    value: string;
    isValidPhoneNumber: boolean;
  };
  devices: {
    input: string | undefined;
    output: string | undefined;
  };
  call: CallStatusDocument | undefined;
  overlay: boolean;
}
