import { createContext } from 'react';
import { ConfiguratonViewState } from './ConfigurationViewState';
import { DefaultConfiguration } from './DefaultConfiguration';

const DefaultConfigurationContext = {
  configuration: DefaultConfiguration,
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
  saveBasic: () => {
    return Promise.resolve();
  },
  getView: (): ConfiguratonViewState => {
    return 'FETCHING';
  },
  setView: (view: ConfiguratonViewState) => {},
  localValidation: { isValid: false, exception: '' },
  isSaving: false,
  setIsSaving: (isSaving: boolean) => {},
  exception: '',
  setException: (message: string) => {},
};

export const ConfigurationContext = createContext(DefaultConfigurationContext);
