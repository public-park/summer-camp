import { ApplicationStore } from './ApplicationStore';
import { UserActivity } from '../models/UserActivity';
import { PhoneState } from '../phone/PhoneState';

export const DefaultApplicationStore: ApplicationStore = {
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
};
