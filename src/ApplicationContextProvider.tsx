import React, { useEffect, useState } from 'react';

import { ApplicationContext } from './context/ApplicationContext';
import { useDispatch, useSelector } from 'react-redux';
import { Action, ActionType } from './actions/ActionType';
import { UserActivity } from './models/enums/UserActivity';
import { UserConnectionState } from './models/enums/UserConnectionState';
import { getWebSocketUrl } from './helpers/UrlHelper';
import { usePersistentToken } from './hooks/usePersistentToken';
import { User } from './models/User';
import { TwilioPhone } from './phone/twilio/TwilioPhone';
import { setActivity, setConnectionState, setLogout, setLogin } from './actions/UserAction';
import { PhoneState } from './phone/PhoneState';
import { usePageLifecycle } from './hooks/usePageLifecycle';
import { selectToken, selectConnectionState, selectCall, selectPhoneState } from './store/Store';

export const ApplicationContextProvider = (props: any) => {
  const call = useSelector(selectCall);
  const phoneState = useSelector(selectPhoneState);

  const persistetToken = usePersistentToken();
  const { isResume } = usePageLifecycle();

  const token = useSelector(selectToken);
  const connectionState = useSelector(selectConnectionState);

  const [user] = useState(new User());
  const [phone] = useState(new TwilioPhone());

  const dispatch = useDispatch();

  const login = (token: string) => {
    user.login(getWebSocketUrl(), token);

    dispatch(setLogin(token));
  };

  const logout = async (reason?: string) => {
    await user.logout();

    dispatch(setLogout(reason));

    if (phoneState === 'RINGING' && call) {
      call.reject();
    }

    phone.destroy();
  };

  useEffect(() => {
    user.onConnectionStateChanged((state: UserConnectionState) => {
      console.log(`connection state changed to: ${state}`);

      dispatch(setConnectionState(user));
    });

    user.onActivityChanged((activity: UserActivity) => {
      console.log(`activity changed to: ${activity}`);

      dispatch(setActivity(user));
    });

    phone.onIncomingCall((call) => {
      const action: Action = {
        type: ActionType.PHONE_INCOMING_CALL,
        payload: { call: call },
      };

      dispatch(action);
    });

    phone.onOutgoingCall((call) => {
      const action: Action = {
        type: ActionType.PHONE_OUTGOING_CALL,
        payload: { call: call },
      };

      dispatch(action);
    });

    phone.onStateChanged((state: PhoneState, ...params: any) => {
      const payload: any = { state: state };

      if (state === 'ERROR') {
        payload.error = params[0].message;
      }

      const action: Action = {
        type: ActionType.PHONE_STATE_CHANGED,
        payload: payload,
      };

      dispatch(action);
    });

    phone.onError((error: Error) => {
      console.log(error);
    });
  }, []);

  useEffect(() => {
    if (persistetToken) {
      login(persistetToken);
    }
  }, [persistetToken]);

  useEffect(() => {
    if (isResume && token && connectionState === UserConnectionState.Closed) {
      user.login(getWebSocketUrl(), token);
    }
  }, [isResume]);

  return (
    <ApplicationContext.Provider
      value={{
        login,
        logout,
        user,
        phone,
      }}
    >
      {props.children}
    </ApplicationContext.Provider>
  );
};
