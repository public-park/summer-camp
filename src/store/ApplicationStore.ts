import { ApplicationPage } from '../actions/PageAction';
import { WorkspaceView } from '../actions/WorkspaceViewAction';
import { PhoneState } from '../phone/PhoneState';
import { MediaDeviceException } from '../exceptions/MediaDeviceException';
import { UserWithPresenceDocument } from '../models/documents/UserDocument';
import { UserConfiguration } from '../models/UserConfiguration';
import { CallStatusDocument } from '../models/documents/CallDocument';
import { ConnectionState } from '../models/Connection';

export interface ApplicationStore {
  connection: {
    state: ConnectionState | undefined;
    sockets: number;
  };
  call: CallStatusDocument | undefined;
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
  users: Map<string, UserWithPresenceDocument>;
}

export interface Phone {
  state: PhoneState;
  token: string | undefined;
  configuration: UserConfiguration | undefined;
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
