import React, { useEffect } from 'react';
import { ConnectionLostAlert } from './NotificationLayer/ConnectionLostAlert';
import { Header } from './Header/Header';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectWorkspaceView,
  selectConnectionState,
  selectWorkspaceNotification,
  selectPhoneInputDevice,
  selectPhoneOutputDevice,
  selectAudioInputDevices,
  selectAudioOutputDevices,
} from '../../store/Store';
import { PhoneView } from './PhoneView/PhoneView';
import { UserConnectionState } from '../../models/UserConnectionState';
import { HeaderThemeProvider } from './Header/HeaderThemeProvider';
import { WorkspaceView } from '../../actions/WorkspaceViewAction';
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
import { showNotification } from '../../actions/NotificationAction';
import { UsersView } from './UsersView/UsersView';

const hasLostDevice = (deviceId: string | undefined, devices: MediaDeviceInfo[] | undefined) => {
  if (!deviceId || !devices) {
    return false;
  }

  return !devices.find((device) => device.deviceId === deviceId);
};

export const Workspace = () => {
  const state = useSelector(selectConnectionState);
  const view = useSelector(selectWorkspaceView);
  const notification = useSelector(selectWorkspaceNotification);
  const phoneInputDevice = useSelector(selectPhoneInputDevice);
  const phoneOutputDevice = useSelector(selectPhoneOutputDevice);
  const audioInputDevices = useSelector(selectAudioInputDevices);
  const audioOutputDevices = useSelector(selectAudioOutputDevices);

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
    if (hasLostDevice(phoneInputDevice, audioInputDevices)) {
      dispatch(lostPhoneInputDevice());
      dispatch(showNotification('Your active microphone device was removed.'));
    }
  }, [phoneInputDevice, audioInputDevices, dispatch]);

  useEffect(() => {
    if (hasLostDevice(phoneOutputDevice, audioOutputDevices)) {
      dispatch(lostPhoneOutputDevice());
      dispatch(showNotification('Your active speaker device was removed.'));
    }
  }, [phoneOutputDevice, audioOutputDevices, dispatch]);

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
        {state === UserConnectionState.Expired && <ConnectionLostAlert />}
        {notification && <NotificationLayer />}

        <HeaderThemeProvider>
          <Header />
        </HeaderThemeProvider>
        {getWorkspaceView(view)}
      </div>
    </div>
  );
};
