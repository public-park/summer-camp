import { useState, useEffect } from 'react';
import { requestUserMedia } from '../helpers/UserMediaHelper';
import { MediaDeviceException } from '../exceptions/MediaDeviceException';

interface AudioDevices {
  input: MediaDeviceInfo[];
  output: MediaDeviceInfo[];
}

export const useAudioDevices = () => {
  const [devices, setDevices] = useState<AudioDevices | undefined>();
  const [exception, setException] = useState<MediaDeviceException | undefined>();

  const addAudioDevicesListener = (f: () => void) => {
    console.debug(`${useAudioDevices.name} add audio device listener`);

    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', f);
    }
  };

  const removeAudioDevicesListener = (f: () => void) => {
    console.debug(`${useAudioDevices.name} remove audio device listener`);
    if (navigator.mediaDevices) {
      navigator.mediaDevices.removeEventListener('devicechange', f);
    }
  };

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

  const getAudioDevices = async () => {
    try {
      setDevices(await getAllAudioDevices());
    } catch (exception) {
      setException(exception);
    }
  };

  useEffect(() => {
    getAudioDevices();
    addAudioDevicesListener(getAudioDevices);

    return () => {
      removeAudioDevicesListener(getAudioDevices);
    };
  }, []);
  return { devices, exception };
};
