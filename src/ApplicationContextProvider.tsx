import React, { useEffect, useState } from 'react';

import { ApplicationContext } from './context/ApplicationContext';
import { useDispatch, useSelector } from 'react-redux';
import { UserActivity } from './models/UserActivity';
import { UserConnectionState } from './models/UserConnectionState';
import { getWebSocketUrl, getUrl } from './helpers/UrlHelper';
import { User } from './models/User';
import { TwilioPhone } from './phone/twilio/TwilioPhone';
import { setActivity, setConnectionState, setLogout, setLogin } from './actions/UserAction';
import { PhoneState } from './phone/PhoneState';
import { usePageLifecycle } from './hooks/usePageLifecycle';
import {
  selectToken,
  selectConnectionState,
  selectPhoneState,
  selectPhoneInputDevice,
  selectPhoneOutputDevice,
  selectAudioInputDevices,
  selectAudioOutputDevices,
  selectPhoneToken,
  selectWorkspaceView,
} from './store/Store';
import {
  setPhoneInputDevice,
  setPhoneOutputDevice,
  setPhoneConfiguration,
  setPhoneToken,
  setPhoneException,
  setPhoneState,
  setPhoneCall,
} from './actions/PhoneAction';

import { useLocalStorageOnPageLoad } from './hooks/useLocalStorageOnPageLoad';
import { useQueryStringToken } from './hooks/useQueryStringToken';
/* Salesforce OpenCTI 
import { useSalesforceOpenCti } from './hooks/useSalesforceOpenCti';
*/
import { request } from './helpers/api/RequestHelper';
import { Call } from './models/Call';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PhoneControl } from './phone/PhoneControl';
import { useFetchPhoneToken } from './hooks/useFetchPhoneToken';

import { setWorkspaceView } from './actions/WorkspaceViewAction';
import { CloseCode } from './models/socket/CloseCode';
import { showNotification } from './actions/NotificationAction';
import { MessageType } from './models/socket/messages/Message';
import { UserMessage } from './models/socket/messages/UserMessage';
import { updateUserList } from './actions/UserListAction';
import { CallDirection } from './models/CallDirection';
import { CallStatus } from './models/CallStatus';
import { ConnectMessage } from './models/socket/messages/ConnectMessage';
import { ConfigurationMessage } from './models/socket/messages/ConfigurationMessage';
import { ErrorMessage } from './models/socket/messages/ErrorMessage';

export const ApplicationContextProvider = (props: any) => {
  const phoneState = useSelector(selectPhoneState);
  const phoneToken = useSelector(selectPhoneToken);

  const [persistetToken, setPersistetToken] = useLocalStorageOnPageLoad('token');
  const [persistedAudioInputDeviceId, setPersistedAudioInputDeviceId] = useLocalStorage('audio-input-device-id');
  const [persistedAudioOutputDeviceId, setPersistedAudioOutputDeviceId] = useLocalStorage('audio-output-device-id');

  const queryStringToken = useQueryStringToken();

  const { isResume } = usePageLifecycle();

  const token = useSelector(selectToken);
  const connectionState = useSelector(selectConnectionState);

  const [user, setUser] = useState<User>(new User());
  const [phone, setPhone] = useState<PhoneControl>();
  const [call, setCall] = useState<undefined | Call>();

  const phoneInputDevice = useSelector(selectPhoneInputDevice);
  const phoneOutputDevice = useSelector(selectPhoneOutputDevice);

  const audioInputDevices = useSelector(selectAudioInputDevices);
  const audioOutputDevices = useSelector(selectAudioOutputDevices);

  const { token: phoneTokenFetched, exception: phoneTokenException } = useFetchPhoneToken(user);

  const view = useSelector(selectWorkspaceView);

  /* Salesforce OpenCTI 
   const doScreenPop = useSalesforceOpenCti(phone);  
  */

  const dispatch = useDispatch();

  const login = (token: string) => {
    const user = new User();

    user.onConnectionStateChanged((state: UserConnectionState, code: number | undefined) => {
      console.log(`connection state changed to: ${state}`);

      if (state === UserConnectionState.Closed && code === CloseCode.TokenExpired) {
        logout('Your session ended, please login again');
        return;
      }

      if (state === UserConnectionState.Closed && code === CloseCode.ConcurrentSession) {
        logout('Your session ended, this user logged in from another device');
        return;
      }

      dispatch(setConnectionState(state, code));
    });

    user.onConnectionError((event: Event) => {
      console.log(`connection error`, event);
    });

    user.onActivityChanged((activity: UserActivity) => {
      console.log(`activity changed to: ${activity}`);

      dispatch(setActivity(user));
    });

    user.onReady(() => {
      dispatch(setPhoneConfiguration(user.configuration));

      if (view === 'CONNECT_VIEW') {
        dispatch(setWorkspaceView('PHONE_VIEW'));
      }
    });

    user.on<ErrorMessage>(MessageType.Error, (message: ErrorMessage) => {
      dispatch(showNotification(`An error occured, please check the JS error log (${message.payload})`));
    });

    user.on<UserMessage>(MessageType.User, (message: UserMessage) => {
      dispatch(updateUserList(message.payload));
    });

    user.on<ConnectMessage>(MessageType.Connect, (message: ConnectMessage) => {
      dispatch(updateUserList(message.payload.list));
    });

    user.on<ConfigurationMessage>(MessageType.Configuration, (message: ConfigurationMessage) => {
      dispatch(setPhoneConfiguration(message.payload));
    });

    const phone = new TwilioPhone(user);

    phone.onStateChanged((state: PhoneState) => {
      console.debug(`Phone onStateChange: ${state}`);
      dispatch(setPhoneState(state));
    });

    phone.onCallStateChanged((call) => {
      if (call && call.direction === CallDirection.Inbound && call.status === CallStatus.Ringing) {
        //doScreenPop(call.phoneNumber);
      }

      dispatch(setPhoneCall(call));

      setCall(call);
    });

    phone.onError((error: Error) => {
      dispatch(setPhoneException(error));
    });

    user.login(getWebSocketUrl(), token);

    setUser(user);
    setPhone(phone);
    setPersistetToken(token);

    dispatch(setLogin(token));
  };

  const logout = async (reason?: string) => {
    await user.logout();

    setPersistetToken(undefined);

    dispatch(setLogout(reason));

    /* manually reject incoming calls */
    if (phoneState === PhoneState.Ringing && call) {
      call.reject();
    }

    phone?.destroy();
  };

  useEffect(() => {
    if (phoneToken && phone) {
      console.log(`Phone device init with token: ${phoneToken?.substr(0, 10)} state was:  ${phoneState}`);
      phone.init(phoneToken);
    }
  }, [phoneToken, phone]);

  useEffect(() => {
    if (phoneTokenException) {
      dispatch(setPhoneException(new Error('Could not fetch token, check your internet connection')));
    }
  }, [phoneTokenException, dispatch]);

  useEffect(() => {
    if (phoneTokenFetched) {
      dispatch(setPhoneToken(phoneTokenFetched));
    }
  }, [phoneTokenFetched, dispatch]);

  useEffect(() => {
    const updateDevice = async (deviceId: string) => {
      try {
        phone && phone.setInputDevice(deviceId);
      } catch (error) {
        console.log(error);
      }
    };

    if (phoneInputDevice && phoneState === PhoneState.Idle) {
      updateDevice(phoneInputDevice);
    }
  }, [phoneInputDevice, phoneState, phone]);

  useEffect(() => {
    const updateDevice = async (deviceId: string) => {
      try {
        phone && phone.setOutputDevice(deviceId);
      } catch (error) {
        console.log(error);
      }
    };

    if (phoneOutputDevice && phoneState === PhoneState.Idle) {
      updateDevice(phoneOutputDevice);
    }
  }, [phoneOutputDevice, phoneState, phone]);

  useEffect(() => {
    if (phoneInputDevice) {
      setPersistedAudioInputDeviceId(phoneInputDevice);
    }
  }, [phoneInputDevice]);

  useEffect(() => {
    if (phoneOutputDevice) {
      setPersistedAudioOutputDeviceId(phoneOutputDevice);
    }
  }, [phoneOutputDevice]);

  /* local storage listeners */
  useEffect(() => {
    const validateToken = async (token: string) => {
      const response = await request(getUrl(`/validate-token`)).post({ token: token });

      if (response.body.isValid) {
        login(token);
      } else {
        console.log(`local token is not valid, deleting from local storage`);
        setPersistetToken(undefined);
      }
    };

    if (persistetToken) {
      validateToken(persistetToken);
    }
  }, [persistetToken]);

  useEffect(() => {
    if (persistedAudioInputDeviceId && audioInputDevices.length > 0 && !phoneInputDevice) {
      if (audioInputDevices.some((device: MediaDeviceInfo) => device.deviceId === persistedAudioInputDeviceId)) {
        dispatch(setPhoneInputDevice(persistedAudioInputDeviceId));
      }
    }
  }, [persistedAudioInputDeviceId, phoneInputDevice, audioInputDevices, dispatch]);

  useEffect(() => {
    if (persistedAudioOutputDeviceId && audioOutputDevices.length > 0 && !phoneOutputDevice) {
      if (audioOutputDevices.some((device: MediaDeviceInfo) => device.deviceId === persistedAudioOutputDeviceId)) {
        dispatch(setPhoneOutputDevice(persistedAudioOutputDeviceId));
      }
    }
  }, [persistedAudioOutputDeviceId, phoneOutputDevice, audioOutputDevices, dispatch]);

  useEffect(() => {
    if (isResume && token && connectionState === UserConnectionState.Closed) {
      user.login(getWebSocketUrl(), token);
    }
  }, [isResume, user]);

  useEffect(() => {
    if (queryStringToken) {
      login(queryStringToken);
    }
  }, [queryStringToken]);

  return (
    <ApplicationContext.Provider
      value={{
        login,
        logout,
        user,
        phone,
        call,
      }}
    >
      {props.children}
    </ApplicationContext.Provider>
  );
};
