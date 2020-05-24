import { createContext } from 'react';

export interface ApplicationContext {
  login: (token: string) => void;
  logout: () => void;
}

export const Context = createContext<ApplicationContext>({
  login: () => {},
  logout: () => {},
});
