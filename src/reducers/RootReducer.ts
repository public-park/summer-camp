import { Store } from '../store/Store';
import produce from 'immer';
import { Action } from '../actions/ActionType';
import { DefaultStore } from '../store/DefaultStore';

const reducer = (state: Store = DefaultStore, action: Action): Store => {
  const isPhoneNumberExpression = /^\+\d+$/g;
  const isNumberExpression = /^\d+$/g;

  return produce(state, (draft) => {
    switch (action.type) {
      case 'USER_CONNECTION_STATE_CHANGED':
        draft.user = action.payload;
        break;

      case 'USER_ACTIVITY_CHANGED':
        draft.user = action.payload;
        break;

      case 'PHONE_DISPLAY_UPDATE':
        if (isNumberExpression.test(action.payload)) {
          action.payload = `+${action.payload}`;
        }

        draft.phone.display = {
          value: action.payload,
          isValidPhoneNumber: isPhoneNumberExpression.test(action.payload),
        };
        break;

      case 'PHONE_DISPLAY_UPDATE_WITH_FOCUS':
        if (isNumberExpression.test(action.payload)) {
          action.payload = `+${action.payload}`;
        }

        draft.phone.display = {
          value: action.payload,
          isValidPhoneNumber: isPhoneNumberExpression.test(action.payload),
        };

        draft.workspace.view = 'PHONE_VIEW';
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
        draft.phone.token = action.payload;

        if (action.payload.error) {
          draft.phone.error = action.payload.error;
        } else {
          draft.phone.error = undefined;
        }

        break;

      case 'PHONE_CONFIGURATION_UPDATED':
        draft.phone.configuration = action.payload;
        draft.workspace.view = 'PHONE_VIEW';
        break;

      case 'PHONE_INPUT_DEVICE_UPDATED':
        draft.phone.devices.input = action.payload;
        break;

      case 'PHONE_OUTPUT_DEVICE_UPDATED':
        draft.phone.devices.output = action.payload;
        break;

      case 'PHONE_INPUT_DEVICE_LOST':
        draft.phone.devices.input = undefined;
        draft.workspace.notification = action.payload;
        break;

      case 'PHONE_OUTPUT_DEVICE_LOST':
        draft.phone.devices.output = undefined;
        draft.workspace.notification = action.payload;
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
        Object.assign(draft, DefaultStore);

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

export default reducer;
