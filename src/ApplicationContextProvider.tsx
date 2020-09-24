import React, { useEffect, useState } from 'react';

import { ApplicationContext } from './context/ApplicationContext';
import { useDispatch, useSelector } from 'react-redux';
import { UserActivity } from './models/enums/UserActivity';
import { UserConnectionState } from './models/enums/UserConnectionState';
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
import { Call } from './phone/Call';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PhoneControl } from './phone/PhoneControl';
import { useFetchPhoneToken } from './hooks/useFetchPhoneToken';
import { UserEvent } from './models/enums/UserEvent';
import { setWorkspaceView } from './actions/WorkspaceViewAction';

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

  const view = useSelector(selectWorkspaceView);

  const { token: phoneTokenFetched, exception: phoneTokenException } = useFetchPhoneToken(user);

  /* Salesforce OpenCTI 
   const doScreenPop = useSalesforceOpenCti(phone);  
  */

  const dispatch = useDispatch();

  const login = (token: string) => {
    const user = new User();

    setUser(user);
    setPersistetToken(token);

    user.login(getWebSocketUrl(), token);

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
    const phone = new TwilioPhone();

    setPhone(phone);

    phone.onIncomingCall((call) => {
      setCall(call);

      /* Salesforce OpenCTI 
        doScreenPop(call.phoneNumber);
      */
    });

    phone.onStateChanged((state: PhoneState, ...params: any) => {
      dispatch(setPhoneState(state));

      /* switch to phone view upon first connect */
      if (view === 'CONNECT_VIEW' && state === PhoneState.Idle) {
        dispatch(setWorkspaceView('PHONE_VIEW'));
      }
    });

    // TODO, add phone exception type
    phone.onError((error: Error) => {
      dispatch(setPhoneException(error));

      if (
        view === 'CONNECT_VIEW' &&
        [PhoneState.Error, PhoneState.Offline, PhoneState.Connecting].includes(phoneState)
      ) {
        dispatch(setWorkspaceView('PHONE_VIEW'));
      }
    });
  }, []);

  useEffect(() => {
    user.onConnectionStateChanged((state: UserConnectionState, code: number | undefined) => {
      console.log(`connection state changed to: ${state}`);

      if (state === UserConnectionState.Closed && code === 4001) {
        logout('Your session ended, please login again');
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

    user.onConfigurationChanged((configuration: any) => {
      phone?.destroy();

      dispatch(setPhoneConfiguration(configuration));

      if (configuration) {
        dispatch([setWorkspaceView('CONNECT_VIEW')]);
      } else {
        dispatch(setWorkspaceView('PHONE_VIEW'));
      }
    });

    user.onError((error: Error) => {
      console.log('user error', error);
    });

    user.on(UserEvent.Call, (call: Call) => {
      dispatch(setPhoneCall(call));

      setCall(phone?.call);
    });

    if (phone) {
      phone.registerUser(user);
    }
  }, [user, phone]);

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
  }, [phoneTokenException]);

  useEffect(() => {
    if (phoneTokenFetched) {
      dispatch(setPhoneToken(phoneTokenFetched));
    }
  }, [phoneTokenFetched]);

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
  }, [phoneInputDevice, phoneState]);

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
  }, [phoneOutputDevice, phoneState]);

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
      if (audioInputDevices.some((device) => device.deviceId === persistedAudioInputDeviceId)) {
        dispatch(setPhoneInputDevice(persistedAudioInputDeviceId));
      }
    }
  }, [persistedAudioInputDeviceId, phoneInputDevice, audioInputDevices]);

  useEffect(() => {
    if (persistedAudioOutputDeviceId && audioOutputDevices.length > 0 && !phoneOutputDevice) {
      if (audioOutputDevices.some((device) => device.deviceId === persistedAudioOutputDeviceId)) {
        dispatch(setPhoneOutputDevice(persistedAudioOutputDeviceId));
      }
    }
  }, [persistedAudioOutputDeviceId, phoneOutputDevice, audioOutputDevices]);

  useEffect(() => {
    if (isResume && token && connectionState === UserConnectionState.Closed) {
      user.login(getWebSocketUrl(), token);
    }
  }, [isResume]);

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
