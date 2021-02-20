import { PhoneState } from '../phone/PhoneState';
import { Call } from '../models/Call';
import {
  PhoneDisplayAction,
  ActionType,
  PhoneErrorAction,
  PhoneConfigurationAction,
  PhoneInputDeviceAction,
  PhoneOutputDeviceAction,
  PhoneInputDeviceLostAction,
  PhoneOutputDeviceLostAction,
  PhoneStateAction,
  PhoneCallStateAction,
  PhoneOverlayAction,
  PhoneTokenAction,
} from './Action';
import { PhoneConfigurationDocument } from '../models/documents/PhoneConfigurationDocument';
import { CallStatusDocument } from '../models/documents/CallDocument';

export const updatePhoneDisplay = (value: string): PhoneDisplayAction => {
  return {
    type: ActionType.PHONE_DISPLAY_UPDATE,
    payload: value,
  };
};

export const setPhoneToken = (token: string): PhoneTokenAction => {
  return {
    type: ActionType.PHONE_TOKEN_UPDATE,
    payload: token,
  };
};

export const setPhoneError = (error: Error): PhoneErrorAction => {
  return {
    type: ActionType.PHONE_ERROR,
    payload: error,
  };
};

export const setPhoneConfiguration = (
  configuration?: PhoneConfigurationDocument | undefined
): PhoneConfigurationAction => {
  return {
    type: ActionType.PHONE_CONFIGURATION_UPDATE,
    payload: configuration,
  };
};

export const setPhoneInputDevice = (device: MediaDeviceInfo | string | undefined): PhoneInputDeviceAction => {
  let deviceId;

  if (device instanceof MediaDeviceInfo) {
    deviceId = device.deviceId;
  } else {
    deviceId = device;
  }

  return {
    type: ActionType.PHONE_INPUT_DEVICE_UPDATE,
    payload: deviceId,
  };
};

export const setPhoneOutputDevice = (device: MediaDeviceInfo | string | undefined): PhoneOutputDeviceAction => {
  let deviceId;

  if (device instanceof MediaDeviceInfo) {
    deviceId = device.deviceId;
  } else {
    deviceId = device;
  }

  return {
    type: ActionType.PHONE_OUTPUT_DEVICE_UPDATE,
    payload: deviceId,
  };
};

export const lostPhoneInputDevice = (): PhoneInputDeviceLostAction => {
  return {
    type: ActionType.PHONE_INPUT_DEVICE_LOST,
    payload: undefined,
  };
};

export const lostPhoneOutputDevice = (): PhoneOutputDeviceLostAction => {
  return {
    type: ActionType.PHONE_OUTPUT_DEVICE_LOST,
    payload: undefined,
  };
};

export const setPhoneState = (state: PhoneState, userId: string): PhoneStateAction => {
  return {
    type: ActionType.PHONE_STATE_CHANGE,
    payload: {
      state: state,
      userId: userId,
    },
  };
};

export const setPhoneCallState = (call: Call | undefined): PhoneCallStateAction => {
  if (!call) {
    return {
      type: ActionType.PHONE_CALL_STATE_CHANGE,
      payload: undefined,
    };
  }

  const { id, from, to, status, direction, answeredAt } = call;

  const payload: CallStatusDocument = { id, from, to, status, direction };

  if (answeredAt) {
    payload.answeredAt = answeredAt.toString();
  }

  return {
    type: ActionType.PHONE_CALL_STATE_CHANGE,
    payload: payload,
  };
};

export const setPhoneOverlay = (state: boolean): PhoneOverlayAction => {
  return {
    type: ActionType.PHONE_OVERLAY,
    payload: state,
  };
};
