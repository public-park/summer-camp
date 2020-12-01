import { createContext } from 'react';
import { User } from '../models/User';
import { PhoneControl } from '../phone/PhoneControl';
import { Call } from '../models/Call';
import { Connection } from '../models/Connection';

export interface ApplicationContextType {
  connection: Connection;
  user: User | undefined;
  phone: PhoneControl | undefined;
  call: Call | undefined;
  login: (token: string) => void;
  logout: (reason?: string) => void;
}

const DefaultApplicationContext: ApplicationContextType = {
  connection: new Connection(),
  user: undefined,
  phone: undefined,
  call: undefined,
  login: () => {},
  logout: () => {},
};

export const ApplicationContext = createContext(DefaultApplicationContext);
