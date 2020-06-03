import { Call } from '../phone/Call';
import { UserActivity } from '../models/enums/UserActivity';
import { UserConnectionState } from '../models/enums/UserConnectionState';
import { ApplicationPage } from '../actions/PageAction';
import { WorkspaceView } from '../actions/WorkspaceViewAction';
import { PhoneState } from '../phone/PhoneState';

export const selectUser = (store: Store) => store.user;
export const selectPhone = (store: Store) => store.phone;
export const selectConfiguration = (store: Store) => store.phone.configuration;
export const selectActivity = (store: Store) => store.user.activity;
export const selectProfileImageUrl = (store: Store) => store.user.profileImageUrl;
export const selectName = (store: Store) => store.user.name;
export const selectCall = (store: Store) => store.call;
export const selectPhoneState = (store: Store) => store.phone.state;
export const selectPhoneToken = (store: Store) => store.phone.token;
export const selectWorkspaceView = (store: Store) => store.workspace.view;
export const selectConnectionState = (store: Store) => store.user.connectionState;
export const selectToken = (store: Store) => store.token;
export const selectPage = (store: Store) => store.page;
export const selectLogoutReason = (store: Store) => store.logout.reason;
export const selectPhoneError = (store: Store) => store.phone.error;

export const selectStore = (store: Store) => store;

export interface Store {
  call: Call | undefined;
  user: {
    id: string;
    name: string;
    profileImageUrl: string | undefined;
    labels: Array<string>;
    activity: UserActivity;
    connectionState: UserConnectionState;
  };
  phone: {
    state: PhoneState;
    token: string | undefined;
    configuration: Configuration | undefined;
    error: string | undefined;
  };
  workspace: {
    view: WorkspaceView;
  };
  logout: {
    reason: string;
  };
  token: string | undefined;
  page: ApplicationPage | undefined;
}

interface Configuration {
  inbound: {
    isEnabled: boolean;
    phoneNumber: string | undefined;
  };
  outbound: {
    isEnabled: boolean;
    mode: string | undefined;
    phoneNumber: string | undefined;
  };
}
