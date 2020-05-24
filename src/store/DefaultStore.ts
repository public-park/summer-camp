import { Store } from './Store';
import { User } from '../models/User';
import { TwilioPhone } from '../phone/twilio/TwilioPhone';
import { UserActivity } from '../models/enums/UserActivity';
import { UserConnectionState } from '../models/enums/UserConnectionState';

export const DefaultStore: Store = {
  user: new User(),
  phone: new TwilioPhone(),
  call: undefined,
  activity: UserActivity.Unknown,
  connectionState: UserConnectionState.Closed,
  phoneState: 'OFFLINE',
  phoneToken: undefined,
  view: 'PHONE',
};
