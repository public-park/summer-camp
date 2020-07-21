import { Store } from './Store';
import { UserActivity } from '../models/enums/UserActivity';
import { UserConnectionState } from '../models/enums/UserConnectionState';

export const DefaultStore: Store = {
  user: {
    id: '',
    name: '',
    profileImageUrl: '',
    tags: [],
    activity: UserActivity.Unknown,
    role: undefined,
    connectionState: UserConnectionState.Closed,
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
  call: undefined,
  workspace: {
    view: 'FETCH_CONFIGURATION_VIEW',
    notification: undefined,
  },
  logout: {
    reason: '',
  },
  token: undefined,
  page: 'LOGIN_PAGE',
};
