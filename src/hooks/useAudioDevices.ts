import { useState, useEffect } from 'react';
import { requestUserMedia } from '../helpers/UserMediaHelper';
import { DeviceNotFoundException } from '../exceptions/DeviceNotFoundException';
import { DeviceNotReadableException } from '../exceptions/DeviceNotReadableException';
import { DeviceNotAllowedException } from '../exceptions/DeviceNotAllowedException';
import { DeviceOverconstrainedException } from '../exceptions/DeviceOverconstrainedException';
import { DeviceException } from '../exceptions/DeviceException';

interface AudioDevices {
  input: MediaDeviceInfo[];
  output: MediaDeviceInfo[];
}

export const useAudioDevices = () => {
  const [devices, setDevices] = useState<AudioDevices | undefined>();
  const [exception, setException] = useState<Error | undefined>();

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
      throw new DeviceNotFoundException('Failed to access media devices. Your browser does not support WebRTC');
    }

    try {
      await requestUserMedia();
    } catch (error) {
      console.error(error.name);
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

      switch (error.name) {
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          throw new DeviceNotFoundException('Failed to access microphone, no device was found.');
        case 'NotReadableError':
          throw new DeviceNotReadableException(
            'Failed to access microphone. An error occured, the system was unable to access your microphone.'
          );
        case 'NotAllowedError':
        case 'PermissionDeniedError':
        case 'PermissionDismissedError':
          throw new DeviceNotAllowedException(
            'You did not permit access to the microphone. Please check your browser settings and allow this page to access your microphone.'
          );
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          throw new DeviceOverconstrainedException(
            'Your system does not support a WebRTC constraint required by this phone'
          );
        case 'TypeError':
          throw new DeviceException(
            'Could not access the microphone, did you try to access this page in an insecure context?'
          );
        default:
          throw new DeviceException('Unknown error');
      }
    }
    const devices = await navigator.mediaDevices.enumerateDevices();

    devices.map((device) => {
      const id = device.deviceId;
      let name: string = '';

      if (device.kind === 'audioinput') {
        name = device.label || `Microphone (${device.deviceId}`;
      }

      if (device.kind === 'audiooutput') {
        name = device.label || `Speaker (${device.deviceId}`;
      }

      if (device.kind === 'videoinput') {
        name = device.label || `Camera (${device.deviceId}`;
      }

      console.log(`found device: ${name} - deviceId: ${id}`);
    });

    return {
      input: devices.filter((device) => device.kind === 'audioinput'),
      output: devices.filter((device) => device.kind === 'audiooutput'),
    };
  };

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        setDevices(await getAllAudioDevices());
      } catch (exception) {
        setException(exception);
      }
    };

    getAudioDevices();
    addAudioDevicesListener(getAudioDevices);

    return () => {
      removeAudioDevicesListener(getAudioDevices);
    };
  }, []);
  return { devices, exception };
};
