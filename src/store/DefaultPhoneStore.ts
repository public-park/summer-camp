import { PhoneState } from '../phone/PhoneState';
import { PhoneStore } from './PhoneStore';

export const DefaultPhoneStore: PhoneStore = {
  state: PhoneState.Offline,
  token: undefined,
  configuration: undefined,
  error: undefined,
  display: {
    value: '',
    isValidPhoneNumber: false,
  },
  devices: {
    input: undefined,
    output: undefined,
  },
};
