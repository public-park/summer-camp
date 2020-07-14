import React from 'react';
import { useAudioDevices } from '../../../hooks/useAudioDevices';
import { Alert } from '@material-ui/lab';
import { Card, CardContent } from '@material-ui/core';
import { AudioDeviceForm } from './AudioDeviceForm';

export const AudioDeviceView = () => {
  const { audioInputDevices, audioOutputDevices, audioDeviceException } = useAudioDevices();

  const getView = () => {
    if (audioDeviceException) {
      return <Alert severity="error">{audioDeviceException.message}</Alert>;
    } else {
      return <AudioDeviceForm audioInputDevices={audioInputDevices} audioOutputDevices={audioOutputDevices} />;
    }
  };

  return (
    <div className="audio-device">
      <Card variant="outlined">
        <CardContent>{getView()}</CardContent>
      </Card>
    </div>
  );
};
