import React from 'react';
import { useSelector } from 'react-redux';
import { selectPage } from './store/Store';
import { Login } from './components/Login/Login';
import { Logout } from './components/Logout/Logout';
import { Workspace } from './components/Workspace/Workspace';
import { ApplicationPage } from './actions/PageAction';

export const Page = () => {
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
        return <Logout />;
    }
  };

  return getPage(page);
};
