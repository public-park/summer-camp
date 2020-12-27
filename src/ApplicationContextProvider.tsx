import React, { useEffect, useState } from 'react';

import { ApplicationContext } from './context/ApplicationContext';
import { useDispatch, useSelector } from 'react-redux';
import { UserActivity } from './models/UserActivity';
import { getWebSocketUrl } from './helpers/UrlHelper';
import { User } from './models/User';
import { TwilioPhone } from './phone/twilio/TwilioPhone';
import { setActivity, setReady } from './actions/UserAction';
import { PhoneState } from './phone/PhoneState';
import { usePageLifecycle } from './hooks/usePageLifecycle';
import {
  selectToken,
  selectConnectionState,
  selectPhoneInputDevice,
  selectPhoneOutputDevice,
  selectWorkspaceView,
  selectIsPageLoaded,
} from './store/Store';
import { setPhoneConfiguration, setPhoneError, setPhoneState, setPhoneCallState } from './actions/PhoneAction';

/* Salesforce OpenCTI 
import { useSalesforceOpenCti } from './hooks/useSalesforceOpenCti';
*/

import { PhoneControl } from './phone/PhoneControl';
import { setWorkspaceView } from './actions/WorkspaceViewAction';
import { CloseCode } from './models/socket/CloseCode';
import { showNotification } from './actions/NotificationAction';
import { MessageType } from './models/socket/messages/Message';
import { UserMessage } from './models/socket/messages/UserMessage';
import { updateUserList } from './actions/UserListAction';
import { ConnectMessage } from './models/socket/messages/ConnectMessage';
import { ConfigurationMessage } from './models/socket/messages/ConfigurationMessage';
import { ErrorMessage } from './models/socket/messages/ErrorMessage';
import { Connection, ConnectionState } from './models/Connection';
import { setConnectionState } from './actions/ConnectionAction';
import { validateUserToken } from './services/RequestService';
import { getContextFromLocalStorage, setContextOnLocalStorage } from './services/LocalStorageContext';
import { onPageLoad, setLogin, setLogout } from './actions/ApplicationAction';
import { Call } from './models/Call';

export const ApplicationContextProvider = (props: any) => {
  const { isResume } = usePageLifecycle();

  const inputDevice = useSelector(selectPhoneInputDevice);
  const outputDevice = useSelector(selectPhoneOutputDevice);
  const token = useSelector(selectToken);
  const connectionState = useSelector(selectConnectionState);
  const isPageLoaded = useSelector(selectIsPageLoaded);

  const [connection, setConnection] = useState<Connection>(new Connection());

  const [user, setUser] = useState<User | undefined>();
  const [phone, setPhone] = useState<PhoneControl | undefined>();
  const [call, setCall] = useState<Call | undefined>();

  const view = useSelector(selectWorkspaceView);

  /* Salesforce OpenCTI 
   const doScreenPop = useSalesforceOpenCti(phone);  
  */

  const dispatch = useDispatch();

  const login = (token: string) => {
    const connection = new Connection();

    connection.onStateChanged((state: ConnectionState, code: number | undefined) => {
      console.log(`connection state changed to: ${state}`);

      if (state === ConnectionState.Closed && code === CloseCode.TokenExpired) {
        logout('Your session ended, please login again');
        return;
      }

      if (state === ConnectionState.Closed && code === CloseCode.ConcurrentSession) {
        logout('Your session ended, this user logged in from another device');
        return;
      }

      dispatch(setConnectionState(state, code));
    });

    connection.onError((event: Event) => {
      console.log(`connection error`, event);
    });

    connection.on<ErrorMessage>(MessageType.Error, (message: ErrorMessage) => {
      dispatch(showNotification(`An error occured, please check the JS error log (${message.payload})`));
    });

    connection.on<UserMessage>(MessageType.User, (message: UserMessage) => {
      dispatch(updateUserList(message.payload));
    });

    connection.on<ConnectMessage>(MessageType.Connect, (message: ConnectMessage) => {
      dispatch(updateUserList(message.payload.list));

      const { id, name, profileImageUrl, accountId, tags, activity, role } = message.payload.user;

      const user = new User(
        connection,
        id,
        name,
        profileImageUrl,
        accountId,
        new Set(tags),
        activity,
        role,
        message.payload.configuration
      );

      user.onActivityChanged((activity: UserActivity) => {
        console.log(`activity changed to: ${activity}`);

        dispatch(setActivity(user));
      });

      const phone = new TwilioPhone(user);

      phone.setConstraints({
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: true,
      });

      phone.onStateChanged((state: PhoneState) => {
        console.debug(`Phone onStateChange: ${state}`);
        dispatch(setPhoneState(state, user.id as string));
      });

      phone.onCallStateChanged((call) => {
        setCall(call);

        dispatch(setPhoneCallState(call));
      });

      phone.onError((error: Error) => {
        console.error(error);
        dispatch(setPhoneError(error));
      });

      setPhone(phone);
      setUser(user);

      dispatch(setReady(user));
      dispatch(setPhoneConfiguration(user.configuration));

      if (view === 'CONNECT_VIEW') {
        dispatch(setWorkspaceView('PHONE_VIEW'));
      }
    });

    connection.on<ConfigurationMessage>(MessageType.Configuration, (message: ConfigurationMessage) => {
      dispatch(setPhoneConfiguration(message.payload));
    });

    setConnection(connection);

    connection.login(getWebSocketUrl(), token);

    dispatch(setLogin(token));
  };

  const logout = async (reason?: string) => {
    if (connection.state !== ConnectionState.Closed) {
      await connection.logout();
    }

    /* store context temporary */
    const context = setContextOnLocalStorage({
      token: undefined,
      input: inputDevice,
      output: outputDevice,
    });

    dispatch(setLogout(reason));
    dispatch(onPageLoad(context!));
  };

  useEffect(() => {
    const initiate = async () => {
      const context = getContextFromLocalStorage();

      /* check for SAML 2.0 token */
      const params = new URLSearchParams(window.location.search);

      if (params.has('token')) {
        console.log(`found ${params.get('token')} on query string`);

        /* always remove tokens from url, it should never be bookmarked or shared */
        window.history.pushState('', 'Summe Camp', '/');

        context.token = params.get('token') as string;
      }

      try {
        if (context.token && !(await validateUserToken(context.token))) {
          context.token = undefined;
        }
      } catch (error) {
        console.log(error);
      }

      dispatch(onPageLoad(context));

      if (context.token) {
        login(context.token);
      }
    };

    initiate();
  }, [dispatch]);

  useEffect(() => {
    /* persist only after page was initiated */
    if (!isPageLoaded) {
      return;
    }

    setContextOnLocalStorage({
      token: token,
      input: inputDevice,
      output: outputDevice,
    });
  }, [token, inputDevice, outputDevice, isPageLoaded]);

  useEffect(() => {
    if (isResume && token && connectionState === ConnectionState.Closed) {
      connection.login(getWebSocketUrl(), token);
    }
  }, [isResume, token]);

  return (
    <ApplicationContext.Provider
      value={{
        login,
        logout,
        connection,
        user,
        phone,
        call,
      }}
    >
      {props.children}
    </ApplicationContext.Provider>
  );
};
