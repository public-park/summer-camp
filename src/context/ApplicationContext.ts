import { createContext } from 'react';
import { User } from '../models/User';
import { PhoneControl } from '../phone/PhoneControl';
import { TwilioPhone } from '../phone/twilio/TwilioPhone';
import { Call } from '../phone/Call';

export interface ApplicationContextType {
  user: User;
  phone: PhoneControl | undefined;
  call: Call | undefined;
  login: (token: string) => void;
  logout: (reason?: string) => void;
}

const DefaultApplicationContext: ApplicationContextType = {
  user: new User(),
  phone: undefined,
  call: undefined,
  login: () => {},
  logout: () => {},
};

export const ApplicationContext = createContext(DefaultApplicationContext);
