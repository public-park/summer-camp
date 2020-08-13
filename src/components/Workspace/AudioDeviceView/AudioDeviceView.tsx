import React from 'react';
import { Alert } from '@material-ui/lab';
import { Card, CardContent } from '@material-ui/core';
import { AudioDeviceForm } from './AudioDeviceForm';
import { useSelector } from 'react-redux';
import { selectAudioInputDevices, selectAudioOutputDevices, selectDeviceException } from '../../../store/Store';

export const AudioDeviceView = () => {
  const audioInputDevices = useSelector(selectAudioInputDevices);
  const audioOutputDevices = useSelector(selectAudioOutputDevices);
  const audioDeviceException = useSelector(selectDeviceException);

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
