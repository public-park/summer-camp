import { ApplicationPage } from '../actions/PageAction';
import { WorkspaceView } from '../actions/WorkspaceViewAction';
import { UserWithPresenceDocument } from '../models/documents/UserDocument';
import { ConnectionState } from '../models/Connection';

export interface ApplicationStore {
  connection: {
    state: ConnectionState | undefined;
    sockets: number;
  };
  devices: {
    audio: {
      input: Array<MediaDeviceInfo>;
      output: Array<MediaDeviceInfo>;
    };
    exception: Error | undefined;
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
  isPageLoaded: boolean;
}
