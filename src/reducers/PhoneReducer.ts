import produce from 'immer';
import { ActionType, ApplicationAction } from '../actions/Action';
import { IS_NUMBER_REGEXP, IS_PHONE_NUMBER_REGEXP } from '../Constants';
import { PhoneState } from '../phone/PhoneState';
import { DefaultPhoneStore } from '../store/DefaultPhoneStore';
import { PhoneStore } from '../store/PhoneStore';

const phone = (state: PhoneStore = DefaultPhoneStore, action: ApplicationAction): PhoneStore => {
  return produce(state, (draft) => {
    if (action.type === ActionType.PHONE_STATE_CHANGE) {
      if (action.payload.state === PhoneState.Expired) {
        draft.token = undefined;
      }

      if (action.payload.state !== PhoneState.Error) {
        draft.error = undefined;
      }

      if (action.payload.state !== PhoneState.Busy) {
        draft.overlay = false;
      }

      draft.state = action.payload.state;
      draft.userId = action.payload.userId;
    }

    if (action.type === ActionType.PHONE_DISPLAY_UPDATE) {
      if (IS_NUMBER_REGEXP.test(action.payload)) {
        action.payload = `+${action.payload}`;
      }

      draft.display = {
        value: action.payload,
        isValidPhoneNumber: IS_PHONE_NUMBER_REGEXP.test(action.payload),
      };
    }

    if (action.type === ActionType.PHONE_ERROR) {
      draft.error = action.payload.message;
    }

    if (action.type === ActionType.PHONE_TOKEN_UPDATE) {
      draft.token = action.payload;
    }

    if (action.type === ActionType.PHONE_CONFIGURATION_UPDATE) {
      draft.configuration = action.payload;
      draft.token = undefined;
    }

    if (action.type === ActionType.PHONE_INPUT_DEVICE_UPDATE) {
      draft.devices.input = action.payload;
    }

    if (action.type === ActionType.PHONE_OUTPUT_DEVICE_UPDATE) {
      draft.devices.output = action.payload;
    }

    if (action.type === ActionType.PHONE_INPUT_DEVICE_LOST) {
      draft.devices.input = undefined;
    }

    if (action.type === ActionType.PHONE_OUTPUT_DEVICE_LOST) {
      draft.devices.output = undefined;
    }

    if (action.type === ActionType.APPLICATION_PAGE_LOAD) {
      draft.devices.input = action.payload.input;
      draft.devices.output = action.payload.output;
    }

    if (action.type === ActionType.PHONE_CALL_STATE_CHANGE) {
      draft.call = action.payload;
    }

    if (action.type === ActionType.PHONE_OVERLAY) {
      draft.overlay = action.payload;
    }
  });
};

export default phone;
