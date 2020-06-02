import React, { useEffect, useContext } from 'react';
import { ConnectionLostAlertBadge } from './ConnectionLostAlertBadge';
import { Header } from './Header/Header';
import { PhoneConfigurationContainer } from './PhoneConfigurationView/PhoneConfigurationContainer';
import { useSelector, useDispatch } from 'react-redux';
import { selectWorkspaceView, selectConnectionState } from '../../store/Store';
import { PhoneParent } from './PhoneView/PhoneParent';
import { PhoneContainer } from './PhoneView/PhoneContainer';
import { UserConnectionState } from '../../models/enums/UserConnectionState';
import { PhoneConfigurationView } from './PhoneConfigurationView/PhoneConfigurationView';
import { HeaderThemeProvider } from './Header/HeaderThemeProvider';
import { WorkspaceView } from '../../actions/WorkspaceViewAction';
import { CallListView } from './CallListView/CallListView';
import { InititializeView } from './CallListView/InitializeView';
import { fetchUserConfiguration } from './PhoneConfigurationView/services/fetchUserConfiguration';
import { ApplicationContext } from '../../context/ApplicationContext';
import { ActionType } from '../../actions/ActionType';

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
      } finally {
        dispatch({
          type: ActionType.PHONE_CONFIGURATION_UPDATED,
          payload: { configuration: configuration },
        });
      }
    };

    if (view == 'FETCH_CONFIGURATION_VIEW' && connectionState == UserConnectionState.Open) {
      init();
    }
  }, [view, connectionState]);

  const getWorkspaceView = (view: WorkspaceView) => {
    switch (view) {
      case 'SETUP_VIEW':
        return (
          <PhoneConfigurationContainer>
            <PhoneConfigurationView />
          </PhoneConfigurationContainer>
        );

      case 'PHONE_VIEW':
        return (
          <PhoneContainer>
            <PhoneParent />
          </PhoneContainer>
        );

      case 'CALL_HISTORY_VIEW':
        return <CallListView />;

      case 'FETCH_CONFIGURATION_VIEW':
        return <InititializeView />;
    }
  };

  return (
    <div className="page-body">
      <div className="workspace">
        {connectionState === UserConnectionState.Closed && <ConnectionLostAlertBadge />}

        <HeaderThemeProvider>
          <Header />
        </HeaderThemeProvider>

        {getWorkspaceView(view)}
      </div>
    </div>
  );
};
