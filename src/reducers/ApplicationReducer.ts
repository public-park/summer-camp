import { ApplicationStore } from '../store/ApplicationStore';
import produce from 'immer';
import { ActionType, ApplicationAction } from '../actions/Action';
import { DefaultApplicationStore as Default } from '../store/DefaultApplicationStore';
import { UserWithPresenceDocument } from '../models/documents/UserDocument';

const application = (state: ApplicationStore = Default, action: ApplicationAction): ApplicationStore => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ActionType.APPLICATION_PAGE_LOAD:
        draft.isPageLoaded = true;

        if (!action.payload.token && !draft.logout.reason) {
          draft.page = 'LOGIN_PAGE';
        }
        break;

      case ActionType.CONNECTION_STATE_CHANGE:
        draft.connection.state = action.payload.state;
        break;

      case ActionType.AUDIO_DEVICES_EXCEPTION:
        draft.devices.exception = action.payload;
        draft.workspace.notification = action.payload.message;
        break;

      case ActionType.AUDIO_DEVICES_CHANGE:
        draft.devices.audio.input = action.payload.input;
        draft.devices.audio.output = action.payload.output;
        break;

      case ActionType.WORKSPACE_VIEW:
        draft.workspace.view = action.payload.view;
        break;

      case ActionType.WORKSPACE_NOTIFICATION:
        if (action.payload.isVisible) {
          draft.workspace.notification = action.payload.text;
        } else {
          draft.workspace.notification = undefined;
        }

        break;

      case ActionType.APPLICATION_LOGIN:
        draft.logout.reason = '';
        draft.token = action.payload.token;
        draft.page = 'WORKSPACE_PAGE';
        break;

      case ActionType.USERS_UPDATE:
        action.payload.map((user: UserWithPresenceDocument) => draft.users.set(user.id, user));
        break;

      case ActionType.APPLICATON_LOGOUT:
        Object.assign(draft, Default);

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
