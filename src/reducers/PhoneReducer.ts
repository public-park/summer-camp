import produce from 'immer';
import { ApplicationAction, ApplicationActionType, PageLoadAction } from '../actions/ApplicationAction';
import {
  PhoneAction,
  PhoneActionType,
  PhoneCallStateAction,
  PhoneConfigurationAction,
  PhoneDisplayAction,
  PhoneErrorAction,
  PhoneInputDeviceAction,
  PhoneInputDeviceLostAction,
  PhoneOutputDeviceAction,
  PhoneOutputDeviceLostAction,
  PhoneOverlayAction,
  PhoneStateAction,
  PhoneTokenAction,
} from '../actions/PhoneAction';
import { IS_NUMBER_REGEXP, IS_PHONE_NUMBER_REGEXP } from '../Constants';
import { PhoneState } from '../phone/PhoneState';
import { DefaultPhoneStore } from '../store/DefaultPhoneStore';
import { PhoneStore } from '../store/PhoneStore';

const isPhoneStateAction = (action: PhoneAction | ApplicationAction): action is PhoneStateAction => {
  return action.type === PhoneActionType.PHONE_STATE_CHANGE;
};

const isPhoneDisplayAction = (action: PhoneAction | ApplicationAction): action is PhoneDisplayAction => {
  return action.type === PhoneActionType.PHONE_DISPLAY_UPDATE;
};

const isPhoneErrorAction = (action: PhoneAction | ApplicationAction): action is PhoneErrorAction => {
  return action.type === PhoneActionType.PHONE_ERROR;
};

const isPhoneTokenAction = (action: PhoneAction | ApplicationAction): action is PhoneTokenAction => {
  return action.type === PhoneActionType.PHONE_TOKEN_UPDATE;
};

const isPhoneConfigurationAction = (action: PhoneAction | ApplicationAction): action is PhoneConfigurationAction => {
  return action.type === PhoneActionType.PHONE_CONFIGURATION_UPDATE;
};

const isPhoneInputDeviceAction = (action: PhoneAction | ApplicationAction): action is PhoneInputDeviceAction => {
  return action.type === PhoneActionType.PHONE_INPUT_DEVICE_UPDATE;
};

const isPhoneOutputDeviceAction = (action: PhoneAction | ApplicationAction): action is PhoneOutputDeviceAction => {
  return action.type === PhoneActionType.PHONE_OUTPUT_DEVICE_UPDATE;
};

const isPhoneInputDeviceLostAction = (
  action: PhoneAction | ApplicationAction
): action is PhoneInputDeviceLostAction => {
  return action.type === PhoneActionType.PHONE_INPUT_DEVICE_LOST;
};

const isPhoneOutputDeviceLostAction = (
  action: PhoneAction | ApplicationAction
): action is PhoneOutputDeviceLostAction => {
  return action.type === PhoneActionType.PHONE_OUTPUT_DEVICE_LOST;
};

const isPageLoadAction = (action: PhoneAction | ApplicationAction): action is PageLoadAction => {
  return action.type === ApplicationActionType.PAGE_LOAD;
};

const isCallStateAction = (action: PhoneAction | ApplicationAction): action is PhoneCallStateAction => {
  return action.type === PhoneActionType.PHONE_CALL_STATE_CHANGE;
};

const isPhoneOverlayAction = (action: PhoneAction | ApplicationAction): action is PhoneOverlayAction => {
  return action.type === PhoneActionType.PHONE_OVERLAY;
};

const phone = (state: PhoneStore = DefaultPhoneStore, action: PhoneAction | ApplicationAction): PhoneStore => {
  return produce(state, (draft) => {
    if (isPhoneStateAction(action)) {
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

    if (isPhoneDisplayAction(action)) {
      if (IS_NUMBER_REGEXP.test(action.payload)) {
        action.payload = `+${action.payload}`;
      }

      draft.display = {
        value: action.payload,
        isValidPhoneNumber: IS_PHONE_NUMBER_REGEXP.test(action.payload),
      };
    }

    if (isPhoneErrorAction(action)) {
      draft.error = action.payload.message;
    }

    if (isPhoneTokenAction(action)) {
      draft.token = action.payload;
    }

    if (isPhoneConfigurationAction(action)) {
      draft.configuration = action.payload;
      draft.token = undefined;
    }

    if (isPhoneInputDeviceAction(action)) {
      draft.devices.input = action.payload;
    }

    if (isPhoneOutputDeviceAction(action)) {
      draft.devices.output = action.payload;
    }

    if (isPhoneInputDeviceLostAction(action)) {
      draft.devices.input = 'default';
    }

    if (isPhoneOutputDeviceLostAction(action)) {
      draft.devices.output = 'default';
    }

    if (isPageLoadAction(action)) {
      draft.devices.input = action.payload.input;
      draft.devices.output = action.payload.output;
    }

    if (isCallStateAction(action)) {
      draft.call = action.payload;
    }

    if (isPhoneOverlayAction(action)) {
      draft.overlay = action.payload;
    }
  });
};

export default phone;
