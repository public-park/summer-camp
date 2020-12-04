import React, { useContext, useEffect } from 'react';
import { ConnectionLostAlert } from './NotificationLayer/ConnectionLostAlert';
import { Header } from './Header/Header';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectWorkspaceView,
  selectConnectionState,
  selectWorkspaceNotification,
  selectAudioInputDevices,
  selectAudioOutputDevices,
  selectPhoneInputDevice,
  selectPhoneOutputDevice,
  selectPhoneState,
} from '../../store/Store';
import { PhoneView } from './PhoneView/PhoneView';
import { HeaderThemeProvider } from './Header/HeaderThemeProvider';
import { WorkspaceView } from '../../actions/WorkspaceViewAction';
import { ConnectView } from './ConnectView/ConnectView';
import { CallHistoryView } from './CallHistoryView/CallHistoryView';
import { ConfigurationView } from './ConfigurationView/ConfigurationView';
import {
  lostPhoneInputDevice,
  lostPhoneOutputDevice,
  setPhoneInputDevice,
  setPhoneOutputDevice,
} from '../../actions/PhoneAction';
import { AudioDeviceView } from './AudioDeviceView/AudioDeviceView';
import { NotificationLayer } from './NotificationLayer/NotificationLayer';
import { useReconnectWebSocket } from '../../hooks/useReconnectWebSocket';
import { ConnectionLostWithReconnectAlert } from './NotificationLayer/ConnectionLostWithReconnectAlert';
import { useAudioDevices } from '../../hooks/useAudioDevices';
import { setAudioDevicesException, updateAudioDevices } from '../../actions/AudioDeviceAction';
import { showNotification } from '../../actions/NotificationAction';
import { UsersView } from './UsersView/UsersView';
import { ConnectionState } from '../../models/Connection';
import { ApplicationContext } from '../../context/ApplicationContext';
import { PhoneState } from '../../phone/PhoneState';

const hasLostDevice = (deviceId: string | undefined, devices: MediaDeviceInfo[] | undefined) => {
  if (!deviceId || !devices || devices.length === 0) {
    return false;
  }

  return !devices.find((device) => device.deviceId === deviceId);
};

export const Workspace = () => {
  const { phone } = useContext(ApplicationContext);

  const state = useSelector(selectConnectionState);
  const view = useSelector(selectWorkspaceView);
  const notification = useSelector(selectWorkspaceNotification);
  const inputDevice = useSelector(selectPhoneInputDevice);
  const outputDevice = useSelector(selectPhoneOutputDevice);
  const inputDeviceList = useSelector(selectAudioInputDevices);
  const outputDeviceList = useSelector(selectAudioOutputDevices);
  const phoneState = useSelector(selectPhoneState);

  const { devices, exception } = useAudioDevices();
  const { timer } = useReconnectWebSocket();

  const dispatch = useDispatch();

  useEffect(() => {
    if (exception) {
      dispatch(setAudioDevicesException(exception));
    }
  }, [exception, dispatch]);

  useEffect(() => {
    if (devices) {
      console.debug('phone input/audio devices changed');

      dispatch(
        updateAudioDevices({
          input: devices.input,
          output: devices.output,
        })
      );
    }
  }, [devices, dispatch]);

  useEffect(() => {
    if (hasLostDevice(inputDevice, inputDeviceList)) {
      dispatch(lostPhoneInputDevice());
      dispatch(showNotification('Your active microphone device was removed.'));

      dispatch(setPhoneInputDevice('default'));
    }
  }, [inputDevice, inputDeviceList, dispatch]);

  useEffect(() => {
    if (hasLostDevice(outputDevice, outputDeviceList)) {
      dispatch(lostPhoneOutputDevice());
      dispatch(showNotification('Your active speaker device was removed.'));

      dispatch(setPhoneOutputDevice('default'));
    }
  }, [outputDevice, outputDeviceList, dispatch]);

  useEffect(() => {
    if (!inputDevice || !phone || phoneState !== PhoneState.Idle) {
      return;
    }

    if (inputDeviceList.some((device: MediaDeviceInfo) => device.deviceId === inputDevice)) {
      try {
        phone && phone.setInputDevice(inputDevice);
      } catch (error) {
        console.log(error);
      }
    }
  }, [inputDevice, inputDeviceList, phoneState, phone]);

  useEffect(() => {
    if (!outputDevice || !phone || phoneState !== PhoneState.Idle) {
      return;
    }

    if (outputDeviceList.some((device: MediaDeviceInfo) => device.deviceId === outputDevice)) {
      try {
        phone && phone.setOutputDevice(outputDevice);
      } catch (error) {
        console.log(error);
      }
    }
  }, [outputDevice, outputDeviceList, phoneState, phone]);

  const getWorkspaceView = (view: WorkspaceView) => {
    switch (view) {
      case 'SETUP_VIEW':
        return <ConfigurationView />;

      case 'PHONE_VIEW':
        return <PhoneView />;

      case 'CALL_HISTORY_VIEW':
        return <CallHistoryView />;

      case 'AUDIO_DEVICES_VIEW':
        return <AudioDeviceView />;
      case 'CONNECT_VIEW':
        return <ConnectView />;

      case 'USERS_VIEW':
        return <UsersView />;
    }
  };

  return (
    <div className="page-body">
      <div className="workspace">
        {timer && <ConnectionLostWithReconnectAlert />}
        {state === ConnectionState.Expired && <ConnectionLostAlert />}
        {notification && <NotificationLayer />}

        <HeaderThemeProvider>
          <Header />
        </HeaderThemeProvider>
        {getWorkspaceView(view)}
      </div>
    </div>
  );
};
