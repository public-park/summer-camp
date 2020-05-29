import React from 'react';
import { useSelector } from 'react-redux';
import { selectPage } from '../../store/Store';
import { ApplicationProvider } from '../ApplicationProvider/ApplicationContainer';
import { LoginPage } from '../LoginPage/LoginPage';
import { LogoutPage } from '../LogoutPage/LogoutPage';
import { WorkspacePage } from '../Workspace/WorkspacePage';
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
        return <WorkspacePage />;
      case 'LOGIN_PAGE':
        return <LoginPage />;
      case 'LOGOUT_PAGE':
        return <LogoutPage />;
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
