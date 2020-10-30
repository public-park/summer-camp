import { ApplicationStore } from './ApplicationStore';
import { UserActivity } from '../models/UserActivity';
import { PhoneState } from '../phone/PhoneState';
import { UserRole } from '../models/UserRole';

export const DefaultApplicationStore: ApplicationStore = {
  user: {
    id: '',
    name: '',
    profileImageUrl: '',
    tags: [],
    activity: UserActivity.Unknown,
    role: UserRole.Agent,
    accountId: '',
  },
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
  page: 'LOGIN_PAGE',
  users: new Map(),
};
