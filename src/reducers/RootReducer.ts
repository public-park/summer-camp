import { Store } from '../store/Store';
import produce from 'immer';
import { Action } from '../actions/ActionType';
import { DefaultStore } from '../store/DefaultStore';

const reducer = (state: Store = DefaultStore, action: Action): Store => {
  const isPhoneNumberExpression = /^\+\d+$/g;
  const isNumberExpression = /^\d+$/g;

  return produce(state, (draft) => {
    switch (action.type) {
      case 'USER_CONNECTION_STATE_CHANGE':
        draft.connection.state = action.payload.state;

        break;

      case 'USER_ACTIVITY_CHANGE':
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

      case 'PHONE_EXCEPTION':
        if (state.workspace.view === 'CONNECT_VIEW' && ['ERROR', 'OFFLINE', 'CONNECTING'].includes(state.phone.state)) {
          draft.workspace.view = 'PHONE_VIEW';
        }

        draft.phone.error = action.payload.message;
        break;

      case 'PHONE_STATE_CHANGE':
        if (action.payload === 'EXPIRED') {
          draft.phone.token = undefined;
        }

        if (action.payload === 'IDLE') {
          draft.call = undefined;
        }

        /* switch to phone view upon first connect */
        if (state.workspace.view === 'CONNECT_VIEW' && action.payload === 'IDLE') {
          draft.workspace.view = 'PHONE_VIEW';
        }

        if (action.payload !== 'ERROR') {
          draft.phone.error = undefined;
        }

        draft.phone.state = action.payload;
        break;

      case 'PHONE_INCOMING_CALL':
        draft.call = action.payload.call;
        break;

      case 'PHONE_OUTGOING_CALL':
        draft.call = action.payload.call;
        break;

      case 'PHONE_CALL_UPDATE':
        draft.call = action.payload;
        break;

      case 'PHONE_TOKEN_UPDATE':
        draft.phone.token = action.payload;

        if (action.payload.error) {
          draft.phone.error = action.payload.error;
        } else {
          draft.phone.error = undefined;
        }

        break;

      case 'PHONE_CONFIGURATION_UPDATE':
        draft.phone.configuration = action.payload;
        draft.phone.token = undefined;

        if (action.payload) {
          draft.workspace.view = 'CONNECT_VIEW';
        } else {
          draft.workspace.view = 'PHONE_VIEW';
        }

        break;

      case 'PHONE_INPUT_DEVICE_UPDATE':
        draft.phone.devices.input = action.payload;
        break;

      case 'PHONE_OUTPUT_DEVICE_UPDATE':
        draft.phone.devices.output = action.payload;
        break;

      case 'AUDIO_DEVICES_EXCEPTION':
        draft.devices.exception = action.payload;
        break;

      case 'AUDIO_DEVICES_CHANGE':
        draft.devices.audio.input = action.payload.input;
        draft.devices.audio.output = action.payload.output;
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
