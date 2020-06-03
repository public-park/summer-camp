import { createContext } from 'react';

export const PhoneContext = createContext<PhoneContextType>({
  to: { value: '', isValidPhoneNumber: false },
  updateTo: (to: string) => {},
  isFetching: false,
});

export interface PhoneContextType {
  updateTo: (value: string) => void;
  to: { value: string; isValidPhoneNumber: boolean };
  isFetching: boolean;
}
