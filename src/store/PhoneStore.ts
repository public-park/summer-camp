import { CallStatusDocument } from '../models/documents/CallDocument';
import { PhoneConfigurationDocument } from '../models/documents/PhoneConfigurationDocument';
import { PhoneState } from '../phone/PhoneState';

export interface PhoneStore {
  userId: string | undefined;
  state: PhoneState;
  token: string | undefined;
  configuration: PhoneConfigurationDocument | undefined;
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
