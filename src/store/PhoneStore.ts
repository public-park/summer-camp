import { UserConfiguration } from '../models/UserConfiguration';
import { PhoneState } from '../phone/PhoneState';

export interface PhoneStore {
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
}
