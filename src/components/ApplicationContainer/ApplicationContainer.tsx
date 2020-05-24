import React from 'react';

import { useHistory } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import { Context } from '../../context/ApplicationContext';
import { PhoneState } from '../../phone/PhoneController';
import { selectUser, selectPhone } from '../../store/Store';
import { useDispatch, useSelector } from 'react-redux';
import { Action, ActionType } from '../../actions/ActionType';
import { UserActivity } from '../../models/enums/UserActivity';
import { UserConnectionState } from '../../models/enums/UserConnectionState';
import { getWebSocketUrl } from '../../helpers/UrlHelper';

export const ContextContainer = (props: any) => {
  const history = useHistory();

  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const phone = useSelector(selectPhone);

  const login = (token: string) => {
    user.login(getWebSocketUrl(), token);

    user.onConnectionStateChanged((state: UserConnectionState) => {
      console.log('connection state changed to: ' + state);

      dispatch({ type: ActionType.USER_CONNECTION_STATE_CHANGED, payload: { state: user.connection.state } });

      if (state === UserConnectionState.Open) {
        history.push('/workspace');
      }
      
    });

    user.onActivityChanged((activity: UserActivity) => {
      console.log('activity changed to: ' + activity);

      const action: Action = {
        type: ActionType.USER_ACTIVITY_CHANGED,
        payload: { activity: activity },
      };

      dispatch(action);
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
  };

  const logout = () => {
    user.logout();

    const action: Action = {
      type: ActionType.APPLICATION_LOGOUT,
      payload: {},
    };

    dispatch(action);

    history.push('/');
  };

  const theme = createMuiTheme({
    palette: {},
  });

  return (
    <ThemeProvider theme={theme}>
      <Context.Provider
        value={{
          login,
          logout,
        }}
      >
        {props.children}
      </Context.Provider>
    </ThemeProvider>
  );
};
