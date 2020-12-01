import { ApplicationStore } from '../store/ApplicationStore';
import produce from 'immer';
import { Action } from '../actions/ActionType';
import { PhoneState } from '../phone/PhoneState';
import { IS_PHONE_NUMBER_REGEXP, IS_NUMBER_REGEXP } from '../Constants';
import { DefaultApplicationStore } from '../store/DefaultApplicationStore';
import { UserWithPresenceDocument } from '../models/documents/UserDocument';

const application = (state: ApplicationStore = DefaultApplicationStore, action: Action): ApplicationStore => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'PAGE_LOAD':
        draft.phone.devices.input = action.payload.input;
        draft.phone.devices.output = action.payload.output;
        draft.token = action.payload.token;

        if (!action.payload.token) {
          draft.page = 'LOGIN_PAGE';
        }

        break;

      case 'CONNECTION_STATE_CHANGE':
        draft.connection.state = action.payload.state;

        break;

      case 'PHONE_DISPLAY_UPDATE':
        if (IS_NUMBER_REGEXP.test(action.payload)) {
          action.payload = `+${action.payload}`;
        }

        draft.phone.display = {
          value: action.payload,
          isValidPhoneNumber: IS_PHONE_NUMBER_REGEXP.test(action.payload),
        };
        break;

      case 'PHONE_ERROR':
        draft.phone.error = action.payload.message;
        break;

      case 'PHONE_STATE_CHANGE':
        if (action.payload === PhoneState.Expired) {
          draft.phone.token = undefined;
        }

        if (action.payload !== PhoneState.Error) {
          draft.phone.error = undefined;
        }

        draft.phone.state = action.payload;
        break;

      case 'CALL_STATE_CHANGE':
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
        break;

      case 'PHONE_OUTPUT_DEVICE_LOST':
        draft.phone.devices.output = undefined;
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
