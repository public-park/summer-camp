import { PhoneState } from '../phone/PhoneState';
import { Call } from '../models/Call';
import { UserConfiguration } from '../models/UserConfiguration';

export enum PhoneActionType {
  PHONE_STATE_CHANGE = 'PHONE_STATE_CHANGE',
  PHONE_DISPLAY_UPDATE = 'PHONE_DISPLAY_UPDATE',
  PHONE_TOKEN_UPDATE = 'PHONE_TOKEN_UPDATE',
  PHONE_CONFIGURATION_UPDATE = 'PHONE_CONFIGURATION_UPDATE',
  PHONE_OUTPUT_DEVICE_UPDATE = 'PHONE_OUTPUT_DEVICE_UPDATE',
  PHONE_INPUT_DEVICE_UPDATE = 'PHONE_INPUT_DEVICE_UPDATE',
  PHONE_OUTPUT_DEVICE_LOST = 'PHONE_OUTPUT_DEVICE_LOST',
  PHONE_INPUT_DEVICE_LOST = 'PHONE_INPUT_DEVICE_LOST',
  PHONE_ERROR = 'PHONE_ERROR',
  PHONE_CALL_STATE_CHANGE = 'PHONE_CALL_STATE_CHANGE',
  PHONE_OVERLAY = 'PHONE_OVERLAY',
}

export interface PhoneDisplayAction {
  type: PhoneActionType;
  payload: string;
}

export const updatePhoneDisplay = (value: string): PhoneDisplayAction => {
  return {
    type: PhoneActionType.PHONE_DISPLAY_UPDATE,
    payload: value,
  };
};

export interface PhoneTokenAction {
  type: PhoneActionType;
  payload: string;
}

export const setPhoneToken = (token: string): PhoneTokenAction => {
  return {
    type: PhoneActionType.PHONE_TOKEN_UPDATE,
    payload: token,
  };
};

export interface PhoneErrorAction {
  type: PhoneActionType;
  payload: Error;
}

export const setPhoneError = (error: Error): PhoneErrorAction => {
  return {
    type: PhoneActionType.PHONE_ERROR,
    payload: error,
  };
};

export interface PhoneConfigurationAction {
  type: PhoneActionType;
  payload: UserConfiguration | undefined;
}

export const setPhoneConfiguration = (configuration?: UserConfiguration | undefined): PhoneConfigurationAction => {
  return {
    type: PhoneActionType.PHONE_CONFIGURATION_UPDATE,
    payload: configuration,
  };
};

export interface PhoneInputDeviceAction {
  type: PhoneActionType;
  payload: string | undefined;
}

export const setPhoneInputDevice = (device: MediaDeviceInfo | string | undefined): PhoneInputDeviceAction => {
  let deviceId;

  if (device instanceof MediaDeviceInfo) {
    deviceId = device.deviceId;
  } else {
    deviceId = device;
  }

  return {
    type: PhoneActionType.PHONE_INPUT_DEVICE_UPDATE,
    payload: deviceId,
  };
};

export interface PhoneOutputDeviceAction {
  type: PhoneActionType;
  payload: string | undefined;
}

export const setPhoneOutputDevice = (device: MediaDeviceInfo | string | undefined): PhoneOutputDeviceAction => {
  let deviceId;

  if (device instanceof MediaDeviceInfo) {
    deviceId = device.deviceId;
  } else {
    deviceId = device;
  }

  return {
    type: PhoneActionType.PHONE_OUTPUT_DEVICE_UPDATE,
    payload: deviceId,
  };
};

export interface PhoneInputDeviceLostAction {
  type: PhoneActionType;
  payload: undefined;
}

export const lostPhoneInputDevice = (): PhoneInputDeviceLostAction => {
  return {
    type: PhoneActionType.PHONE_INPUT_DEVICE_LOST,
    payload: undefined,
  };
};

export interface PhoneOutputDeviceLostAction {
  type: PhoneActionType;
  payload: undefined;
}

export const lostPhoneOutputDevice = (): PhoneOutputDeviceLostAction => {
  return {
    type: PhoneActionType.PHONE_OUTPUT_DEVICE_LOST,
    payload: undefined,
  };
};

export interface PhoneStateAction {
  type: PhoneActionType;
  payload: {
    state: PhoneState;
    userId: string;
  };
}

export const setPhoneState = (state: PhoneState, userId: string): PhoneStateAction => {
  return {
    type: PhoneActionType.PHONE_STATE_CHANGE,
    payload: {
      state: state,
      userId: userId,
    },
  };
};

export interface PhoneCallStateAction {
  type: PhoneActionType;
  payload: Call | undefined;
}

export const setPhoneCallState = (call: Call | undefined): PhoneCallStateAction => {
  return {
    type: PhoneActionType.PHONE_CALL_STATE_CHANGE,
    payload: call,
  };
};

export interface PhoneOverlayAction {
  type: PhoneActionType;
  payload: boolean;
}

export const setPhoneOverlay = (state: boolean): PhoneOverlayAction => {
  return {
    type: PhoneActionType.PHONE_OVERLAY,
    payload: state,
  };
};

export type PhoneAction =
  | PhoneDisplayAction
  | PhoneTokenAction
  | PhoneErrorAction
  | PhoneConfigurationAction
  | PhoneInputDeviceAction
  | PhoneOutputDeviceAction
  | PhoneInputDeviceLostAction
  | PhoneOutputDeviceLostAction
  | PhoneStateAction
  | PhoneCallStateAction
  | PhoneOverlayAction;
