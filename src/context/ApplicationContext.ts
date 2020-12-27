import { createContext } from 'react';
import { User } from '../models/User';
import { PhoneControl } from '../phone/PhoneControl';
import { Connection } from '../models/Connection';
import { Call } from '../models/Call';

export interface ApplicationContextType {
  connection: Connection;
  user: User | undefined;
  phone: PhoneControl | undefined;
  call: Call | undefined;
  login: (token: string) => void;
  logout: (reason?: string) => void;
}

export const ApplicationContext = createContext<ApplicationContextType>(null!);
