import { createContext } from 'react';

export const PhoneContext = createContext<PhoneContextInterface>({
  to: { value: '', isValidPhoneNumber: false },
  updateTo: (to: string) => {},
  isFetching: false,
  error: undefined,
});

export interface PhoneContextInterface {
  updateTo: (value: string) => void;
  to: { value: string; isValidPhoneNumber: boolean };
  isFetching: boolean;
  error: Error | undefined;
}
