import React, { useContext } from 'react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { IconButton, createMuiTheme, ThemeProvider, FormControlLabel, Avatar } from '@material-ui/core';
import '@material/react-icon-button/dist/icon-button.css';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import 'typeface-roboto';
import { SetupButton } from './SetupButton';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectActivity } from '../../../store/Store';
import { setView } from '../../../actions/ViewAction';
import { Context } from '../../../context/ApplicationContext';
import { UserActivity } from '../../../models/enums/UserActivity';
import { UserConnectionState } from '../../../models/enums/UserConnectionState';

const outerTheme = createMuiTheme({
  palette: {
    secondary: {
      main: '#fff',
    },
  },
});

const PurpleSwitch = withStyles({
  switchBase: {
    color: '#e0e0e0',
    '&$checked': {
      color: '#43C16E',
    },
    '&$checked + $track': {
      backgroundColor: '#f5f5f5',
    },
  },
  checked: {},
  track: {},
})(Switch);

export const Header = () => {
  const { logout } = useContext(Context);

  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const activity = useSelector(selectActivity);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      user.activity = UserActivity.WaitingForWork;
    } else {
      user.activity = UserActivity.Away;
    }

    console.log('set state to: ' + user.activity);
  };

  return (
    <div className="header">
      <ThemeProvider theme={outerTheme}>
        <Avatar src={user.profileUrl} alt={user.name?.toString()}>
          {user.name?.toUpperCase().substr(0, 1)}
        </Avatar>

        <div className="name">{user.name}</div>

        <div className="user-status-toggle">
          {user.connection.state === UserConnectionState.Open && (
            <FormControlLabel
              control={
                <PurpleSwitch
                  checked={UserActivity.WaitingForWork === activity}
                  onChange={handleChange}
                  name="checkedA"
                />
              }
              label="Available"
            />
          )}
        </div>

        <div className="disconnect-button">
          <SetupButton onClick={() => dispatch(setView('SETUP'))} color="secondary" />
        </div>

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
      </ThemeProvider>
    </div>
  );
};
