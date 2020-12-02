import React, { useContext } from 'react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { IconButton, Avatar } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { setWorkspaceView } from '../../../actions/WorkspaceViewAction';
import { ActivityPanel } from './ActivityPanel';
import { AudioDeviceButton } from './Navigation/AudioDeviceButton';
import { HistoryButton } from './Navigation/HistoryButton';
import { PhoneButton } from './Navigation/PhoneButton';
import { SetupButton } from './Navigation/SetupButton';
import { SetupButtonDisabled } from './Navigation/SetupButtonDisabled';
import { UsersButton } from './Navigation/UsersButton';
import { ConnectionState } from '../../../models/Connection';
import { selectCall, selectUser } from '../../../store/Store';

export const Header = () => {
  const { logout, connection } = useContext(ApplicationContext);

  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const call = useSelector(selectCall);

  return (
    <div className="header">
      <div>
        <Avatar src={user.profileImageUrl} alt={user.name}>
          {user.name?.toUpperCase().substr(0, 1)}
        </Avatar>
        <div className="name">{user.name}</div>

        <div className="user-status-toggle">{connection.state === ConnectionState.Open && <ActivityPanel />}</div>
        <div>
          <PhoneButton name="phone" onClick={() => dispatch(setWorkspaceView('PHONE_VIEW'))} color="secondary" />
        </div>
        <div>
          <HistoryButton
            name="call-history"
            onClick={() => dispatch(setWorkspaceView('CALL_HISTORY_VIEW'))}
            color="secondary"
          />
        </div>
        <div>
          <AudioDeviceButton
            name="audio-devices"
            onClick={() => dispatch(setWorkspaceView('AUDIO_DEVICES_VIEW'))}
            color="secondary"
          />
        </div>
        <div>
          <UsersButton name="users" onClick={() => dispatch(setWorkspaceView('USERS_VIEW'))} color="secondary" />
        </div>
        {user.role === 'owner' && (
          <div>
            {call ? (
              <SetupButtonDisabled name="setup" color="secondary" />
            ) : (
              <SetupButton name="setup" onClick={() => dispatch(setWorkspaceView('SETUP_VIEW'))} color="secondary" />
            )}
          </div>
        )}
        <div className="setup-button">
          <IconButton
            name="logout"
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
