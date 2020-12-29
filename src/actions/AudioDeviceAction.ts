import { AudioDevicesUpdateAction, ActionType, AudioDevicesExceptionAction } from './Action';

export const updateAudioDevices = (devices: {
  input: MediaDeviceInfo[];
  output: MediaDeviceInfo[];
}): AudioDevicesUpdateAction => {
  return {
    type: ActionType.AUDIO_DEVICES_CHANGE,
    payload: devices,
  };
};

export const setAudioDevicesException = (exception: Error): AudioDevicesExceptionAction => {
  return {
    type: ActionType.AUDIO_DEVICES_EXCEPTION,
    payload: exception,
  };
};
