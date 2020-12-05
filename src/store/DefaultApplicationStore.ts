import { ApplicationStore } from './ApplicationStore';

export const DefaultApplicationStore: ApplicationStore = {
  connection: {
    state: undefined,
    sockets: 0,
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
