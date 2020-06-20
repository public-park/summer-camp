import React, { useEffect, useContext } from 'react';
import { ConnectionLostAlert } from './NotificationLayer/ConnectionLostAlert';
import { Header } from './Header/Header';
import { useSelector, useDispatch } from 'react-redux';
import { selectWorkspaceView, selectConnectionState } from '../../store/Store';
import { PhoneView } from './PhoneView/PhoneView';
import { UserConnectionState } from '../../models/enums/UserConnectionState';
import { HeaderThemeProvider } from './Header/HeaderThemeProvider';
import { WorkspaceView } from '../../actions/WorkspaceViewAction';
import { ApplicationContext } from '../../context/ApplicationContext';
import { fetchUserConfiguration } from './ConfigurationView/services/fetchUserConfiguration';
import { ConnectView } from './ConnectView/ConnectView';
import { CallHistoryView } from './CallHistoryView/CallHistoryView';
import { ConfigurationView } from './ConfigurationView/ConfigurationView';
import { ConfigurationContextProvider } from './ConfigurationView/ConfigurationContextProvider';
import { setPhoneConfiguration } from '../../actions/PhoneAction';

export const Workspace = () => {
  const { user } = useContext(ApplicationContext);

  const connectionState = useSelector(selectConnectionState);
  const view = useSelector(selectWorkspaceView);

  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      let configuration;

      try {
        configuration = await fetchUserConfiguration(user);
      } catch {
      } finally {
        dispatch(setPhoneConfiguration(configuration));
      }
    };

    if (view === 'FETCH_CONFIGURATION_VIEW' && connectionState === UserConnectionState.Open) {
      init();
    }
  }, [view, connectionState]);

  const getWorkspaceView = (view: WorkspaceView) => {
    switch (view) {
      case 'SETUP_VIEW':
        return (
          <ConfigurationContextProvider>
            <ConfigurationView />
          </ConfigurationContextProvider>
        );

      case 'PHONE_VIEW':
        return <PhoneView />;

      case 'CALL_HISTORY_VIEW':
        return <CallHistoryView />;

      case 'FETCH_CONFIGURATION_VIEW':
        return <ConnectView />;
    }
  };

  return (
    <div className="page-body">
      <div className="workspace">
        {connectionState === UserConnectionState.Closed && <ConnectionLostAlert />}

        <HeaderThemeProvider>
          <Header />
        </HeaderThemeProvider>

        {getWorkspaceView(view)}
      </div>
    </div>
  );
};
