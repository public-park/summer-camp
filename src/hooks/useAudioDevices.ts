import { useState, useEffect } from 'react';
import { requestUserMedia } from '../helpers/UserMediaHelper';
import { MediaDeviceException } from '../exceptions/MediaDeviceException';
import { useSelector } from 'react-redux';
import { selectConnectionState } from '../store/Store';
import { UserConnectionState } from '../models/enums/UserConnectionState';

export const useAudioDevices = () => {
  const connectionState = useSelector(selectConnectionState);

  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDeviceException, setAudioDeviceException] = useState<MediaDeviceException | undefined>();

  const getAllAudioDevices = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new MediaDeviceException('Failed to access media devices. Your browser does not support WebRTC');
    }

    try {
      await requestUserMedia();
    } catch (error) {
      throw new MediaDeviceException(
        'Failed to access microphone and speaker. Please check your browser settings and allow this page to access your microphone.'
      );
    }
    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      input: devices.filter((device) => device.kind === 'audioinput'),
      output: devices.filter((device) => device.kind === 'audiooutput'),
    };
  };

  useEffect(() => {
    async function getAudioDevices() {
      try {
        const devices = await getAllAudioDevices();

        setAudioInputDevices(devices.input);
        setAudioOutputDevices(devices.output);
      } catch (exception) {
        setAudioDeviceException(exception);
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', () => {
      getAudioDevices();
    });

    if (connectionState === UserConnectionState.Open) {
      getAudioDevices();
    }
  }, [connectionState]);

  return { audioInputDevices, audioOutputDevices, audioDeviceException };
};
