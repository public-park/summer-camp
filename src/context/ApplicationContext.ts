import { createContext } from 'react';
import { User } from '../models/User';
import { PhoneControl } from '../phone/PhoneControl';
import { TwilioPhone } from '../phone/twilio/TwilioPhone';

export interface ApplicationContextType {
  user: User;
  phone: PhoneControl;
  login: (token: string) => void;
  logout: (reason?: string) => void;
}

const DefaultApplicationContext: ApplicationContextType = {
  user: new User(),
  phone: new TwilioPhone(new User()),
  login: () => {},
  logout: () => {},
};

export const ApplicationContext = createContext(DefaultApplicationContext);
