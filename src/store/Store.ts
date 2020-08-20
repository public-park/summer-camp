import { UserActivity } from '../models/enums/UserActivity';
import { UserConnectionState } from '../models/enums/UserConnectionState';
import { ApplicationPage } from '../actions/PageAction';
import { WorkspaceView } from '../actions/WorkspaceViewAction';
import { PhoneState } from '../phone/PhoneState';
import { UserRole } from '../models/enums/UserRole';
import { CallStatus } from '../phone/Call';
import { MediaDeviceException } from '../exceptions/MediaDeviceException';

export const selectUser = (store: Store) => store.user;
export const selectRole = (store: Store) => store.user.role;
export const selectPhone = (store: Store) => store.phone;
export const selectConfiguration = (store: Store) => store.phone.configuration;
export const selectActivity = (store: Store) => store.user.activity;
export const selectProfileImageUrl = (store: Store) => store.user.profileImageUrl;
export const selectName = (store: Store) => store.user.name;
export const selectCall = (store: Store) => store.call;
export const selectPhoneState = (store: Store) => store.phone.state;
export const selectPhoneToken = (store: Store) => store.phone.token;
export const selectPhoneInputDevice = (store: Store) => store.phone.devices.input;
export const selectPhoneOutputDevice = (store: Store) => store.phone.devices.output;
export const selectWorkspaceView = (store: Store) => store.workspace.view;
export const selectWorkspaceNotification = (store: Store) => store.workspace.notification;
export const selectConnectionState = (store: Store) => store.connection.state;
export const selectToken = (store: Store) => store.token;
export const selectPage = (store: Store) => store.page;
export const selectLogoutReason = (store: Store) => store.logout.reason;
export const selectPhoneError = (store: Store) => store.phone.error;
export const selectPhoneDisplay = (store: Store) => store.phone.display;
export const selectPhoneDisplayIsValidPhoneNumber = (store: Store) => store.phone.display.isValidPhoneNumber;
export const selectPhoneDisplayValue = (store: Store) => store.phone.display.value;
export const selectAudioInputDevices = (store: Store) => store.devices.audio.input;
export const selectAudioOutputDevices = (store: Store) => store.devices.audio.output;
export const selectDeviceException = (store: Store) => store.devices.exception;

export const selectStore = (store: Store) => store;

export interface Store {
  call: Call | undefined;
  user: {
    id: string;
    name: string;
    profileImageUrl: string | undefined;
    tags: Array<string>;
    activity: UserActivity;
    role: UserRole | undefined;
    sockets: number | undefined;
  };
  connection: {
    state: UserConnectionState | undefined;
  };
  phone: {
    state: PhoneState;
    token: string | undefined;
    configuration: Configuration | undefined;
    error: string | undefined;
    display: {
      value: string;
      isValidPhoneNumber: any;
    };
    devices: {
      input: string | undefined;
      output: string | undefined;
    };
  };
  devices: {
    audio: {
      input: Array<MediaDeviceInfo>;
      output: Array<MediaDeviceInfo>;
    };
    exception: MediaDeviceException | undefined;
  };
  workspace: {
    view: WorkspaceView;
    notification: string | undefined;
  };
  logout: {
    reason: string;
  };
  token: string | undefined;
  page: ApplicationPage | undefined;
}

interface Call {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
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
