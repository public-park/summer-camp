import React, { useEffect } from 'react';

import { useHistory } from 'react-router-dom';
import { ConnectionLostAlertBadge } from './ConnectionLostAlertBadge';
import { SetupHeader } from './Header/SetupHeader';
import { Header } from './Header/Header';
import { PhoneConfigurationContainer } from './PhoneConfigurationView/PhoneConfigurationContainer';
import { useSelector } from 'react-redux';
import { selectUser, selectView, selectConnectionState } from '../../store/Store';
import { PhoneParent } from './PhoneView/PhoneParent';
import { PhoneContainer } from './PhoneView/PhoneContainer';
import { UserConnectionState } from '../../models/enums/UserConnectionState';
import { PhoneConfigurationParent } from './PhoneConfigurationView/PhoneConfigurationParent';
import { PhoneConfigurationView } from './PhoneConfigurationView/PhoneConfigurationView';

export const Workspace = () => {
  const history = useHistory();

  const user = useSelector(selectUser);
  const view = useSelector(selectView);
  const connectionState = useSelector(selectConnectionState);

  useEffect(() => {
    if (!user.token) {
      history.push('/offline');
    }
  }, [user.token, history]);

  return (
    <div className="page-body">
      <div className="workspace">
        {connectionState === UserConnectionState.Closed && <ConnectionLostAlertBadge />}

        {view === 'SETUP' ? <SetupHeader /> : <Header />}

        {view === 'SETUP' ? (
          <PhoneConfigurationContainer>
            <PhoneConfigurationParent>
              <PhoneConfigurationView />
            </PhoneConfigurationParent>
          </PhoneConfigurationContainer>
        ) : (
          <PhoneContainer>
            <PhoneParent />
          </PhoneContainer>
        )}
      </div>
    </div>
  );
};
