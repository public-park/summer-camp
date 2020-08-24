import { ActionType } from './ActionType';
import { PhoneState } from '../phone/PhoneState';
import { Call } from '../phone/Call';

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
    type: ActionType.PHONE_TOKEN_UPDATE,
    payload: token,
  };
};

export interface PhoneExceptionAction {
  type: ActionType;
  payload: Error;
}

export const setPhoneException = (error: Error): PhoneExceptionAction => {
  return {
    type: ActionType.PHONE_EXCEPTION,
    payload: error,
  };
};

export interface PhoneConfigurationAction {
  type: ActionType;
  payload: any | undefined;
}

export const setPhoneConfiguration = (configuration?: any): PhoneConfigurationAction => {
  return {
    type: ActionType.PHONE_CONFIGURATION_UPDATE,
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
    type: ActionType.PHONE_INPUT_DEVICE_UPDATE,
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
    type: ActionType.PHONE_OUTPUT_DEVICE_UPDATE,
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

export interface PhoneStateAction {
  type: ActionType;
  payload: PhoneState;
}

export const setPhoneState = (state: PhoneState): PhoneCallAction => {
  return {
    type: ActionType.PHONE_STATE_CHANGE,
    payload: state,
  };
};

export interface PhoneIncomingCallAction {
  type: ActionType;
  payload: Call;
}

export const setIncomingCall = (call: Call): PhoneIncomingCallAction => {
  return {
    type: ActionType.PHONE_INCOMING_CALL,
    payload: call,
  };
};

export interface PhoneOutgoingCallAction {
  type: ActionType;
  payload: Call;
}

export const setOutgoingCall = (call: Call): PhoneOutgoingCallAction => {
  return {
    type: ActionType.PHONE_OUTGOING_CALL,
    payload: call,
  };
};
