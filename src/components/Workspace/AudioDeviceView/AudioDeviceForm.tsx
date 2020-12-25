import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { AudioDeviceSelect } from './AudioDeviceSelect';
import { useSelector, useDispatch } from 'react-redux';
import { selectPhoneInputDevice, selectPhoneOutputDevice } from '../../../store/Store';
import { setPhoneInputDevice, setPhoneOutputDevice } from '../../../actions/PhoneAction';
import { Alert } from '@material-ui/lab';

interface AudioDeviceFormProps {
  audioInputDevices: Array<MediaDeviceInfo>;
  audioOutputDevices: Array<MediaDeviceInfo>;
}

export const AudioDeviceForm = (props: AudioDeviceFormProps) => {
  const dispatch = useDispatch();

  const input = useSelector(selectPhoneInputDevice);
  const output = useSelector(selectPhoneOutputDevice);

  const updateInputDevice = (device: MediaDeviceInfo | undefined) => {
    dispatch(setPhoneInputDevice(device));
  };

  const updateOutputDevice = (device: MediaDeviceInfo | undefined) => {
    dispatch(setPhoneOutputDevice(device));
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Microphone
      </Typography>
      <Box mt={2} mb={2}>
        <Typography variant="body1">Select the device you want to use as a microphone from the list.</Typography>
      </Box>
      {props.audioInputDevices.length > 0 && (
        <AudioDeviceSelect
          name="input-devices"
          handleUpdate={updateInputDevice}
          value={input ? input : 'default'}
          devices={props.audioInputDevices}
        />
      )}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Speaker
        </Typography>
        <Box mt={2} mb={2}>
          <Typography variant="body1">Select the device you want to use as a speaker from the list.</Typography>
        </Box>
        {props.audioOutputDevices.length > 0 && (
          <AudioDeviceSelect
            name="output-devices"
            handleUpdate={updateOutputDevice}
            value={output ? output : 'default'}
            devices={props.audioOutputDevices}
          />
        )}

        {props.audioOutputDevices.length === 0 && (
          <span>
            <Alert variant="filled" severity="warning">
              Your browser does not support setting the speaker device, please configure the speaker on your operating
              system
            </Alert>
          </span>
        )}
      </Box>
    </div>
  );
};
