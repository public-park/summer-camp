import { Store } from './Store';
import { UserActivity } from '../models/enums/UserActivity';

export const DefaultStore: Store = {
  user: {
    id: '',
    name: '',
    profileImageUrl: '',
    tags: [],
    activity: UserActivity.Unknown,
    role: undefined,
    sockets: undefined,
  },
  connection: {
    state: undefined,
  },
  phone: {
    state: 'OFFLINE',
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
  page: 'LOGIN_PAGE',
};
