import { Store } from '../store/Store';
import produce from 'immer';
import { Action } from '../actions/ActionType';
import { DefaultStore } from '../store/DefaultStore';
import { UserConnectionState } from '../models/enums/UserConnectionState';
import { UserActivity } from '../models/enums/UserActivity';

const reducer = (state: Store = DefaultStore, action: Action): Store => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'USER_CONNECTION_STATE_CHANGED':
        draft.user = action.payload.user;
        break;

      case 'USER_ACTIVITY_CHANGED':
        draft.user = action.payload.user;
        break;

      case 'PHONE_STATE_CHANGED':
        if (action.payload.state === 'EXPIRED') {
          draft.phone.token = undefined;
        }
        if (action.payload.state === 'IDLE') {
          draft.call = undefined;
        }

        if (action.payload.state === 'ERROR') {
          draft.phone.error = action.payload.error;
        } else {
          draft.phone.error = undefined;
        }

        draft.phone.state = action.payload.state;
        break;

      case 'PHONE_INCOMING_CALL':
        draft.call = action.payload.call;
        break;

      case 'PHONE_OUTGOING_CALL':
        draft.call = action.payload.call;
        break;

      case 'PHONE_TOKEN_UPDATED':
        draft.phone.token = action.payload.token;
        break;

      case 'PHONE_CONFIGURATION_UPDATED':
        draft.phone.configuration = action.payload.configuration;
        draft.workspace.view = 'PHONE_VIEW';
        break;

      case 'WORKSPACE_VIEW':
        draft.workspace.view = action.payload.view;
        break;

      case 'USER_CONFIGURATION_CHANGED':
        draft.phone.token = undefined;
        draft.phone.state = 'OFFLINE';
        draft.phone.configuration = undefined;
        draft.workspace.view = 'FETCH_CONFIGURATION_VIEW';
        break;

      case 'USER_LOGIN':
        draft.logout.reason = '';
        draft.token = action.payload.token;
        draft.page = 'WORKSPACE_PAGE';
        break;

      case 'USER_LOGOUT':
        if (action.payload.reason) {
          draft.page = 'LOGOUT_PAGE';
          draft.logout.reason = action.payload.reason;
        } else {
          draft.page = 'LOGIN_PAGE';
        }

        draft.phone.token = undefined;
        draft.phone.state = 'OFFLINE';
        draft.phone.configuration = undefined;
        draft.workspace.view = 'FETCH_CONFIGURATION_VIEW';
        draft.call = undefined;
        draft.token = undefined;

        draft.user.id = '';
        draft.user.name = '';
        draft.user.profileImageUrl = undefined;
        draft.user.labels = [];
        draft.user.activity = UserActivity.Unknown;
        draft.user.connectionState = UserConnectionState.Closed;
        break;
    }
  });
};

export default reducer;
