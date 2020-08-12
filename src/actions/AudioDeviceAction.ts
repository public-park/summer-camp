import { ActionType } from './ActionType';
import { MediaDeviceException } from '../exceptions/MediaDeviceException';

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
  payload: MediaDeviceException;
}

export const setAudioDevicesException = (exception: MediaDeviceException): AudioDevicesExceptionAction => {
  return {
    type: ActionType.AUDIO_DEVICES_EXCEPTION,
    payload: exception,
  };
};
