import React, { useEffect, useState } from 'react';

import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { ApplicationContext } from '../../context/ApplicationContext';
import { PhoneState } from '../../phone/PhoneController';
import { useDispatch } from 'react-redux';
import { Action, ActionType } from '../../actions/ActionType';
import { UserActivity } from '../../models/enums/UserActivity';
import { UserConnectionState } from '../../models/enums/UserConnectionState';
import { getWebSocketUrl } from '../../helpers/UrlHelper';
import { usePersistentToken } from './hooks/usePersistentToken';
import { User } from '../../models/User';
import { TwilioPhone } from '../../phone/twilio/TwilioPhone';
import { setActivity, setConnectionState, setLogout, setLogin } from '../../actions/UserAction';

export const ApplicationProvider = (props: any) => {
  const persistetToken = usePersistentToken();

  const [user] = useState(new User());
  const [phone] = useState(new TwilioPhone());

  const dispatch = useDispatch();

  const login = (token: string) => {
    user.login(getWebSocketUrl(), token);

    user.onConnectionStateChanged((state: UserConnectionState) => {
      console.log(`connection state changed to: ${state}`);

      dispatch(setActivity(user));
    });

    user.onActivityChanged((activity: UserActivity) => {
      console.log(`activity changed to: ${activity}`);

      dispatch(setConnectionState(user));
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

    phone.onStateChanged((state: PhoneState) => {
      const action: Action = {
        type: ActionType.PHONE_STATE_CHANGED,
        payload: { state: state },
      };

      dispatch(action);
    });

    dispatch(setLogin(token));
  };

  const logout = (reason?: string) => {
    user.logout();

    dispatch(setLogout(reason));
  };

  const theme = createMuiTheme({
    palette: {},
  });

  useEffect(() => {
    if (persistetToken) {
      login(persistetToken);
    }
  }, [persistetToken]);

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};
