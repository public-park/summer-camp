import { PhoneState } from '../phone/PhoneState';
import { Call } from '../models/Call';
import { UserConfiguration } from '../models/UserConfiguration';

export enum PhoneActionType {
  STATE_CHANGE = 'STATE_CHANGE',
  DISPLAY_UPDATE = 'DISPLAY_UPDATE',
  TOKEN_UPDATE = 'TOKEN_UPDATE',
  CONFIGURATION_UPDATE = 'CONFIGURATION_UPDATE',
  OUTPUT_DEVICE_UPDATE = 'OUTPUT_DEVICE_UPDATE',
  INPUT_DEVICE_UPDATE = 'INPUT_DEVICE_UPDATE',
  OUTPUT_DEVICE_LOST = 'OUTPUT_DEVICE_LOST',
  INPUT_DEVICE_LOST = 'INPUT_DEVICE_LOST',
  PHONE_ERROR = 'PHONE_ERROR',
}

export interface PhoneDisplayAction {
  type: PhoneActionType;
  payload: string;
}

export const updatePhoneDisplay = (value: string): PhoneDisplayAction => {
  return {
    type: PhoneActionType.DISPLAY_UPDATE,
    payload: value,
  };
};

export interface PhoneTokenAction {
  type: PhoneActionType;
  payload: string;
}

export const setPhoneToken = (token: string): PhoneTokenAction => {
  return {
    type: PhoneActionType.TOKEN_UPDATE,
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
    type: PhoneActionType.CONFIGURATION_UPDATE,
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
    type: PhoneActionType.INPUT_DEVICE_UPDATE,
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
    type: PhoneActionType.OUTPUT_DEVICE_UPDATE,
    payload: deviceId,
  };
};

export interface PhoneInputDeviceLostAction {
  type: PhoneActionType;
  payload: undefined;
}

export const lostPhoneInputDevice = (): PhoneInputDeviceLostAction => {
  return {
    type: PhoneActionType.INPUT_DEVICE_LOST,
    payload: undefined,
  };
};

export interface PhoneOutputDeviceLostAction {
  type: PhoneActionType;
  payload: undefined;
}

export const lostPhoneOutputDevice = (): PhoneOutputDeviceLostAction => {
  return {
    type: PhoneActionType.OUTPUT_DEVICE_LOST,
    payload: undefined,
  };
};

export interface PhoneCallAction {
  type: PhoneActionType;
  payload: Call | undefined;
}

export const setPhoneCall = (call: Call | undefined): PhoneCallAction => {
  return {
    type: PhoneActionType.STATE_CHANGE,
    payload: call,
  };
};

export interface PhoneStateAction {
  type: PhoneActionType;
  payload: PhoneState;
}

export const setPhoneState = (state: PhoneState): PhoneStateAction => {
  return {
    type: PhoneActionType.STATE_CHANGE,
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
  | PhoneStateAction;
