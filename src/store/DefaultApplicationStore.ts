import { ApplicationStore } from './ApplicationStore';
import { PhoneState } from '../phone/PhoneState';

export const DefaultApplicationStore: ApplicationStore = {
  connection: {
    state: undefined,
    sockets: 0,
  },
  phone: {
    state: PhoneState.Offline,
    token: undefined,
    configuration: undefined,
    error: undefined,
    display: {
      value: '',
      isValidPhoneNumber: false,
    },
    devices: {
      input: undefined,
      output: undefined,
    },
  },
  devices: {
    audio: {
      input: [],
      output: [],
    },
    exception: undefined,
  },
  call: undefined,
  workspace: {
    view: 'CONNECT_VIEW',
    notification: undefined,
  },
  logout: {
    reason: '',
  },
  token: undefined,
  page: 'INIT_PAGE',
  users: new Map(),
};
