import { ApplicationStore } from '../store/ApplicationStore';
import produce from 'immer';
import { Action } from '../actions/ActionType';
import { DefaultApplicationStore } from '../store/DefaultApplicationStore';
import { UserWithPresenceDocument } from '../models/documents/UserDocument';

const application = (state: ApplicationStore = DefaultApplicationStore, action: Action): ApplicationStore => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'PAGE_LOAD':
        if (!action.payload.token) {
          draft.page = 'LOGIN_PAGE';
        }
        break;

      case 'CONNECTION_STATE_CHANGE':
        draft.connection.state = action.payload.state;
        break;

      case 'CALL_STATE_CHANGE':
        draft.call = action.payload;
        break;

      case 'AUDIO_DEVICES_EXCEPTION':
        draft.devices.exception = action.payload;
        break;

      case 'AUDIO_DEVICES_CHANGE':
        draft.devices.audio.input = action.payload.input;
        draft.devices.audio.output = action.payload.output;
        break;

      case 'WORKSPACE_VIEW':
        draft.workspace.view = action.payload.view;
        break;

      case 'WORKSPACE_NOTIFICATION_SHOW':
        draft.workspace.notification = action.payload;
        break;

      case 'WORKSPACE_NOTIFICATION_HIDE':
        draft.workspace.notification = undefined;
        break;

      case 'USER_LOGIN':
        draft.logout.reason = '';
        draft.token = action.payload.token;
        draft.page = 'WORKSPACE_PAGE';
        break;

      case 'USER_LIST_UPDATE':
        action.payload.map((user: UserWithPresenceDocument) => draft.users.set(user.id, user));
        break;

      case 'USER_LOGOUT':
        Object.assign(draft, DefaultApplicationStore);

        if (action.payload.reason) {
          draft.page = 'LOGOUT_PAGE';
          draft.logout.reason = action.payload.reason;
        } else {
          draft.page = 'LOGIN_PAGE';
        }
        break;
    }
  });
};

export default application;
