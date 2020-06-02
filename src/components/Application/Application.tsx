import React from 'react';
import { useSelector } from 'react-redux';
import { selectPage } from '../../store/Store';
import { ApplicationProvider } from '../ApplicationProvider/ApplicationProvider';
import { Login } from '../Login/Login';
import { Logout } from '../Logout/Logout';
import { Workspace } from '../Workspace/Workspace';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { blue, green } from '@material-ui/core/colors';
import { ApplicationPage } from '../../actions/PageAction';

function Application() {
  const theme = createMuiTheme({
    palette: {
      primary: blue,
      secondary: green,
    },
  });

  const page = useSelector(selectPage);

  const getPage = (page: ApplicationPage | undefined) => {
    switch (page) {
      case 'WORKSPACE_PAGE':
        return <Workspace />;
      case 'LOGIN_PAGE':
        return <Login />;
      case 'LOGOUT_PAGE':
        return <Logout />;
      default:
        return '';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ApplicationProvider>{getPage(page)}</ApplicationProvider>
    </ThemeProvider>
  );
}

export default Application;
