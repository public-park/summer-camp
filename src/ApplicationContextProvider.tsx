import React, { useEffect, useState } from 'react';

import { ApplicationContext } from './context/ApplicationContext';
import { useDispatch } from 'react-redux';
import { Action, ActionType } from './actions/ActionType';
import { UserActivity } from './models/enums/UserActivity';
import { UserConnectionState } from './models/enums/UserConnectionState';
import { getWebSocketUrl } from './helpers/UrlHelper';
import { usePersistentToken } from './hooks/usePersistentToken';
import { User } from './models/User';
import { TwilioPhone } from './phone/twilio/TwilioPhone';
import { setActivity, setConnectionState, setLogout, setLogin } from './actions/UserAction';
import { PhoneState } from './phone/PhoneState';

export const ApplicationContextProvider = (props: any) => {
  const persistetToken = usePersistentToken();

  const [user] = useState(new User());
  const [phone] = useState(new TwilioPhone());

  const dispatch = useDispatch();

  const login = (token: string) => {
    user.login(getWebSocketUrl(), token);

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

    dispatch(setLogin(token));
  };

  const logout = async (reason?: string) => {
    await user.logout();

    phone.destroy();

    dispatch(setLogout(reason));
  };

  useEffect(() => {
    if (persistetToken) {
      login(persistetToken);
    }
  }, [persistetToken]);

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
