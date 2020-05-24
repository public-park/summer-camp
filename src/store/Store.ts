import { User } from '../models/User';
import { PhoneState, PhoneControl } from '../phone/PhoneController';
import { Call } from '../phone/Call';
import { ApplicationView } from '../actions/ViewAction';
import { UserActivity } from '../models/enums/UserActivity';
import { UserConnectionState } from '../models/enums/UserConnectionState';

export const selectUser = (store: Store) => store.user;
export const selectPhone = (store: Store) => store.phone;
export const selectActivity = (store: Store) => store.activity;
export const selectCall = (store: Store) => store.call;
export const selectPhoneState = (store: Store) => store.phoneState;
export const selectPhoneToken = (store: Store) => store.phoneToken;
export const selectView = (store: Store) => store.view;
export const selectConnectionState = (store: Store) => store.connectionState;

export interface Store {
  user: User;
  phone: PhoneControl;
  call: Call | undefined;
  activity: UserActivity;
  connectionState: UserConnectionState;
  phoneState: PhoneState;
  phoneToken: string | undefined;
  view: ApplicationView;
}
