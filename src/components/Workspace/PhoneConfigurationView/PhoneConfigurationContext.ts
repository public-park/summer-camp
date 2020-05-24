import { createContext } from 'react';
import { AccountConfiguration } from '../../../models/AccountConfiguration';
import { ConfiguratonViewState } from './ConfigurationViewState';

export const InitialConfiguration: AccountConfiguration = {
  key: undefined,
  secret: undefined,
  accountSid: undefined,
  inbound: { isEnabled: false, phoneNumber: undefined },
  outbound: { isEnabled: false, mode: undefined, phoneNumber: undefined },
};

export const PhoneConfigurationContext = createContext({
  configuration: InitialConfiguration,
  setMode: (mode: string) => {},
  setInboundPhoneNumber: (phoneNumber: string) => {},
  setBaseConfiguration: (key: string, secret: string, accountSid: string) => {},
  enableInbound: () => {},
  disableInbound: () => {},
  enableOutbound: () => {},
  disableOutbound: () => {},
  setOutboundPhoneNumber: (phoneNumber: string) => {},
  save: () => {
    return Promise.resolve();
  },
  getView: (): ConfiguratonViewState => {
    return 'FETCHING';
  },
  setView: (view: ConfiguratonViewState) => {},
  isValid: false,
  isSaving: false,
  hasError: false,
  setIsSaving: (isSaving: boolean) => {},
  error: '',
});
