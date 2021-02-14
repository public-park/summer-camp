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
import { setNotification, WorkspaceView } from '../../actions/WorkspaceAction';
import { ConnectView } from './ConnectView/ConnectView';
import { CallHistoryView } from './CallHistoryView/CallHistoryView';
import { ConfigurationView } from './ConfigurationView/ConfigurationView';
import { lostPhoneInputDevice, lostPhoneOutputDevice } from '../../actions/PhoneAction';
import { AudioDeviceView } from './AudioDeviceView/AudioDeviceView';
import { NotificationLayer } from './NotificationLayer/NotificationLayer';
import { useReconnectWebSocket } from '../../hooks/useReconnectWebSocket';
import { ConnectionLostWithReconnectAlert } from './NotificationLayer/ConnectionLostWithReconnectAlert';
import { useAudioDevices } from '../../hooks/useAudioDevices';
import { setAudioDevicesException, updateAudioDevices } from '../../actions/AudioDeviceAction';
import { UserListView } from './UserListView/UserListView';
import { ConnectionState } from '../../models/Connection';
import { ApplicationContext } from '../../context/ApplicationContext';
import { PhoneState } from '../../phone/PhoneState';
import { useHasLostMediaDevice } from '../../hooks/useHasLostMediaDevice';
import { PhonePreflight } from './PhonePreflight';
import { UserSetupView } from './UserSetupView/UserSetupView';

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

  const hasLostInputDevice = useHasLostMediaDevice(inputDevice, inputDeviceList);
  const hasLostOutputDevice = useHasLostMediaDevice(outputDevice, outputDeviceList);

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
    if (hasLostInputDevice) {
      dispatch(lostPhoneInputDevice());
      dispatch(setNotification(true, 'Your active microphone device was removed.'));
    }
  }, [hasLostInputDevice, dispatch]);

  useEffect(() => {
    if (hasLostOutputDevice) {
      dispatch(lostPhoneOutputDevice());
      dispatch(setNotification(true, 'Your active speaker device was removed.'));
    }
  }, [hasLostOutputDevice, dispatch]);

  useEffect(() => {
    if (!inputDevice || !phone || phoneState !== PhoneState.Idle) {
      return;
    }

    if (inputDeviceList.some((device: MediaDeviceInfo) => device.deviceId === inputDevice)) {
      try {
        phone?.setInputDevice(inputDevice);
      } catch (error) {
        console.log(error);
      }
    }
  }, [inputDevice, inputDeviceList, phoneState, phone]);

  useEffect(() => {
    if (!outputDevice || !phone || phoneState !== PhoneState.Idle) {
      return;
    }

    async function setDevice(deviceId: string) {
      try {
        await phone?.setOutputDevice(deviceId);
      } catch (error) {
        console.error(error);

        dispatch(lostPhoneOutputDevice());
        dispatch(setNotification(true, 'Unable to set output device'));
      }
    }
    setDevice(outputDevice);
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

      case 'USER_LIST_VIEW':
        return <UserListView />;
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

        <PhonePreflight>{getWorkspaceView(view)}</PhonePreflight>
      </div>
    </div>
  );
};
