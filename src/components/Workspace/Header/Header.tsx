import React, { useContext } from 'react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { IconButton, Avatar } from '@material-ui/core';
import { SetupButton } from './Navigation/SetupButton';
import { useDispatch, useSelector } from 'react-redux';
import { selectProfileImageUrl, selectName, selectConnectionState, selectRole, selectCall } from '../../../store/Store';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { UserConnectionState } from '../../../models/UserConnectionState';
import { setWorkspaceView } from '../../../actions/WorkspaceViewAction';
import { ActivityPanel } from './ActivityPanel';
import { HistoryButton } from './Navigation/HistoryButton';
import { PhoneButton } from './Navigation/PhoneButton';
import { AudioDeviceButton } from './Navigation/AudioDeviceButton';
import { UsersButton } from './Navigation/UsersButton';
import { SetupButtonDisabled } from './Navigation/SetupButtonDisabled';

export const Header = () => {
  const { logout } = useContext(ApplicationContext);

  const dispatch = useDispatch();

  const name = useSelector(selectName);
  const role = useSelector(selectRole);
  const call = useSelector(selectCall);
  const profileImageUrl = useSelector(selectProfileImageUrl);
  const connectionState = useSelector(selectConnectionState);

  return (
    <div className="header">
      <div>
        <Avatar src={profileImageUrl} alt={name}>
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
        <div>
          <AudioDeviceButton onClick={() => dispatch(setWorkspaceView('AUDIO_DEVICE_VIEW'))} color="secondary" />
        </div>
        <div>
          <UsersButton onClick={() => dispatch(setWorkspaceView('USERS_VIEW'))} color="secondary" />
        </div>
        {role === 'owner' && (
          <div>
            {call ? (
              <SetupButtonDisabled color="secondary" />
            ) : (
              <SetupButton onClick={() => dispatch(setWorkspaceView('SETUP_VIEW'))} color="secondary" />
            )}
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
