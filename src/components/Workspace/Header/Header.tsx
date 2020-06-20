import React, { useContext } from 'react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { IconButton, Avatar } from '@material-ui/core';
import { SetupButton } from './Navigation/SetupButton';
import { useDispatch, useSelector } from 'react-redux';
import { selectProfileImageUrl, selectName, selectConnectionState } from '../../../store/Store';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { UserConnectionState } from '../../../models/enums/UserConnectionState';
import { setWorkspaceView } from '../../../actions/WorkspaceViewAction';
import { ActivityPanel } from './ActivityPanel';
import { HistoryButton } from './Navigation/HistoryButton';
import { PhoneButton } from './Navigation/PhoneButton';

export const Header = () => {
  const { logout, user } = useContext(ApplicationContext);

  const dispatch = useDispatch();

  const name = useSelector(selectName);
  const profileImageUrl = useSelector(selectProfileImageUrl);
  const connectionState = useSelector(selectConnectionState);

  return (
    <div className="header">
      <div>
        <Avatar src={profileImageUrl} alt={user.name?.toString()}>
          {name?.toUpperCase().substr(0, 1)}
        </Avatar>
        <div className="name">{name}</div>

        <div className="user-status-toggle">{connectionState === UserConnectionState.Open && <ActivityPanel />}</div>
        <div>
          <PhoneButton onClick={() => dispatch(setWorkspaceView('PHONE_VIEW'))} color="secondary" />
        </div>
        <div>
          <HistoryButton onClick={() => dispatch(setWorkspaceView('CALL_HISTORY_VIEW'))} color="secondary" />
        </div>
        {user.role === 'owner' && (
          <div>
            <SetupButton onClick={() => dispatch(setWorkspaceView('SETUP_VIEW'))} color="secondary" />
          </div>
        )}
        <div className="setup-button">
          <IconButton
            color="secondary"
            onClick={() => {
              logout();
            }}
          >
            <ExitToAppIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
