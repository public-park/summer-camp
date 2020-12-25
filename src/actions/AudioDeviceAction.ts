import { ActionType } from './ActionType';
import { DeviceNotFoundException } from '../exceptions/DeviceNotFoundException';

export interface AudioDevicesUpdateAction {
  type: ActionType;
  payload: {
    input: MediaDeviceInfo[];
    output: MediaDeviceInfo[];
  };
}

export const updateAudioDevices = (devices: {
  input: MediaDeviceInfo[];
  output: MediaDeviceInfo[];
}): AudioDevicesUpdateAction => {
  return {
    type: ActionType.AUDIO_DEVICES_CHANGE,
    payload: devices,
  };
};

export interface AudioDevicesExceptionAction {
  type: ActionType;
  payload: Error;
}

export const setAudioDevicesException = (exception: Error): AudioDevicesExceptionAction => {
  return {
    type: ActionType.AUDIO_DEVICES_EXCEPTION,
    payload: exception,
  };
};
