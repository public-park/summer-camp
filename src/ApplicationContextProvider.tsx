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
  selectPhoneToken,
  selectWorkspaceView,
  selectIsPageLoaded,
} from './store/Store';
import {
  setPhoneConfiguration,
  setPhoneToken,
  setPhoneError,
  setPhoneState,
  setPhoneCallState,
} from './actions/PhoneAction';

/* Salesforce OpenCTI 
import { useSalesforceOpenCti } from './hooks/useSalesforceOpenCti';
*/

import { Call } from './models/Call';
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
import { Connection, ConnectionState } from './models/Connection';
import { setConnectionState } from './actions/ConnectionAction';
import { validateUserToken } from './services/RequestService';
import { getContextFromLocalStorage, setContextOnLocalStorage } from './services/LocalStorageContext';
import { onPageLoad, setLogin, setLogout } from './actions/ApplicationAction';
import { useQueryStringParameter } from './hooks/useQueryStringParameter';

export const ApplicationContextProvider = (props: any) => {
  const { isResume } = usePageLifecycle();

  const phoneToken = useSelector(selectPhoneToken);
  const inputDevice = useSelector(selectPhoneInputDevice);
  const outputDevice = useSelector(selectPhoneOutputDevice);
  const token = useSelector(selectToken);
  const connectionState = useSelector(selectConnectionState);
  const isPageLoaded = useSelector(selectIsPageLoaded);

  const [connection, setConnection] = useState<Connection>(new Connection());
  const [user, setUser] = useState<User | undefined>();
  const [phone, setPhone] = useState<PhoneControl>();
  const [call, setCall] = useState<undefined | Call>();
  const edge = useQueryStringParameter('edge');

  const { token: phoneTokenFetched, error: phoneTokenError } = useFetchPhoneToken(user);

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
    });

    connection.on<ConfigurationMessage>(MessageType.Configuration, (message: ConfigurationMessage) => {
      dispatch(setPhoneConfiguration(message.payload));
    });
    // TODO user should be returned by connection.onReady....
    const user = new User(connection);

    user.onActivityChanged((activity: UserActivity) => {
      console.log(`activity changed to: ${activity}`);

      dispatch(setActivity(user));
    });

    user.onReady(() => {
      dispatch(setReady(user));
      dispatch(setPhoneConfiguration(user.configuration));

      if (view === 'CONNECT_VIEW') {
        dispatch(setWorkspaceView('PHONE_VIEW'));
      }
    });

    const phone = new TwilioPhone(connection, user);

    phone.onStateChanged((state: PhoneState) => {
      console.debug(`Phone onStateChange: ${state}`);
      dispatch(setPhoneState(state));
    });

    phone.onCallStateChanged((call) => {
      dispatch(setPhoneCallState(call));

      setCall(call);
    });

    phone.onError((error: Error) => {
      console.error(error);
      dispatch(setPhoneError(error));
    });

    connection.login(getWebSocketUrl(), token);

    setUser(user);
    setPhone(phone);
    setConnection(connection);

    dispatch(setLogin(token));
  };

  const logout = async (reason?: string) => {
    phone?.destroy();

    await connection.logout();

    /* store context temporary */
    const context = setContextOnLocalStorage({
      token: undefined,
      input: inputDevice,
      output: outputDevice,
    });

    dispatch(setLogout(reason));

    if (context) {
      dispatch(onPageLoad(context));
    }
  };

  useEffect(() => {
    if (phoneToken && phone) {
      console.log(`Phone device init with token: ${phoneToken?.substr(0, 10)}`);
      phone.init(phoneToken, edge);
    }
  }, [phoneToken, phone, edge]);

  useEffect(() => {
    if (phoneTokenError) {
      dispatch(setPhoneError(new Error('Could not fetch token, check your internet connection')));
    }
  }, [phoneTokenError, dispatch]);

  useEffect(() => {
    if (phoneTokenFetched) {
      dispatch(setPhoneToken(phoneTokenFetched));
    }
  }, [phoneTokenFetched, dispatch]);

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

      if (context.token && !(await validateUserToken(context.token))) {
        context.token = undefined;
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
