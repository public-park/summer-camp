import { createContext } from 'react';
import { AccountConfiguration } from '../../../models/AccountConfiguration';
import { ConfiguratonViewState } from './ConfigurationViewState';
import { DefaultConfiguration } from './DefaultConfiguration';

const DefaultConfigurationContext: {
  configuration: AccountConfiguration;
  isValidBaseConfiguration: undefined | boolean;
  setMode: (mode: string) => void;
  setInboundPhoneNumber: (phoneNumber: string) => void;
  enableInbound: () => void;
  disableInbound: () => void;
  enableOutbound: () => void;
  disableOutbound: () => void;
  setOutboundPhoneNumber: (phoneNumber: string) => void;
  saveAll: () => Promise<void>;
  saveBaseConfiguration: (key: string, secret: string, accountSid: string) => Promise<void>;
  getView: () => ConfiguratonViewState;
  setView: (view: ConfiguratonViewState) => void;
  localValidation: { isValid: boolean; exception: string };
  isSaving: boolean;
  exception: string;
  setException: (message: string) => void;
} = {
  configuration: DefaultConfiguration,
  isValidBaseConfiguration: undefined,
  setMode: (mode: string) => {},
  setInboundPhoneNumber: (phoneNumber: string) => {},
  enableInbound: () => {},
  disableInbound: () => {},
  enableOutbound: () => {},
  disableOutbound: () => {},
  setOutboundPhoneNumber: (phoneNumber: string) => {},
  saveAll: () => {
    return Promise.resolve();
  },
  saveBaseConfiguration: (key: string, secret: string, accountSid: string) => {
    return Promise.resolve();
  },
  getView: (): ConfiguratonViewState => {
    return 'FETCHING';
  },
  setView: (view: ConfiguratonViewState) => {},
  localValidation: { isValid: false, exception: '' },
  isSaving: false,
  exception: '',
  setException: (message: string) => {},
};

export const ConfigurationContext = createContext(DefaultConfigurationContext);
