import { ActionType } from './ActionType';

export interface PhoneDisplayAction {
  type: ActionType;
  payload: string;
}

export const updatePhoneDisplay = (value: string): PhoneDisplayAction => {
  return {
    type: ActionType.PHONE_DISPLAY_UPDATE,
    payload: value,
  };
};

export const updatePhoneDisplayWithFocus = (value: string): PhoneDisplayAction => {
  return {
    type: ActionType.PHONE_DISPLAY_UPDATE_WITH_FOCUS,
    payload: value,
  };
};

export interface PhoneTokenAction {
  type: ActionType;
  payload: string;
}

export const setPhoneToken = (token: string): PhoneTokenAction => {
  return {
    type: ActionType.PHONE_TOKEN_UPDATED,
    payload: token,
  };
};

export interface PhoneConfigurationAction {
  type: ActionType;
  payload: any | undefined;
}

export const setPhoneConfiguration = (configuration?: any): PhoneConfigurationAction => {
  return {
    type: ActionType.PHONE_CONFIGURATION_UPDATED,
    payload: configuration,
  };
};

export interface PhoneDeviceAction {
  type: ActionType;
  payload: string | undefined;
}

export const setPhoneInputDevice = (device: MediaDeviceInfo | string | undefined): PhoneDeviceAction => {
  let deviceId;

  if (device instanceof MediaDeviceInfo) {
    deviceId = device.deviceId;
  } else {
    deviceId = device;
  }

  return {
    type: ActionType.PHONE_INPUT_DEVICE_UPDATED,
    payload: deviceId,
  };
};

export const setPhoneOutputDevice = (device: MediaDeviceInfo | string | undefined): PhoneDeviceAction => {
  let deviceId;

  if (device instanceof MediaDeviceInfo) {
    deviceId = device.deviceId;
  } else {
    deviceId = device;
  }

  return {
    type: ActionType.PHONE_OUTPUT_DEVICE_UPDATED,
    payload: deviceId,
  };
};

export interface PhoneDeviceLostAction {
  type: ActionType;
  payload: string;
}

export const lostPhoneInputDevice = (notificaton: string): PhoneDeviceLostAction => {
  return {
    type: ActionType.PHONE_INPUT_DEVICE_LOST,
    payload: notificaton,
  };
};

export const lostPhoneOutputDevice = (notificaton: string): PhoneDeviceLostAction => {
  return {
    type: ActionType.PHONE_OUTPUT_DEVICE_LOST,
    payload: notificaton,
  };
};

export interface PhoneCallAction {
  type: ActionType;
  payload: string;
}

export const setPhoneCall = (call: string): PhoneCallAction => {
  return {
    type: ActionType.PHONE_CALL_UPDATE,
    payload: call,
  };
};
