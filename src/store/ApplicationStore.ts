import { UserActivity } from '../models/UserActivity';
import { UserConnectionState } from '../models/UserConnectionState';
import { ApplicationPage } from '../actions/PageAction';
import { WorkspaceView } from '../actions/WorkspaceViewAction';
import { PhoneState } from '../phone/PhoneState';
import { UserRole } from '../models/UserRole';
import { CallStatus, CallDirection } from '../phone/Call';
import { MediaDeviceException } from '../exceptions/MediaDeviceException';

export interface ApplicationStore {
  call: Call | undefined;
  user: User;
  connection: {
    state: UserConnectionState | undefined;
  };
  phone: Phone;
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

export interface User {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Array<string>;
  activity: UserActivity;
  role: UserRole | undefined;
  sockets: number | undefined;
}

export interface Call {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
  direction: CallDirection;
  answeredAt: Date | undefined;
}

export interface Phone {
  state: PhoneState;
  token: string | undefined;
  configuration: PhoneConfiguration | undefined;
  error: string | undefined;
  display: {
    value: string;
    isValidPhoneNumber: boolean;
  };
  devices: {
    input: string | undefined;
    output: string | undefined;
  };
}

export interface PhoneConfiguration {
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
