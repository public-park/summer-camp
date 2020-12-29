import React from 'react';
import { useSelector } from 'react-redux';
import { selectPage } from './store/Store';
import { Login } from './components/Login/Login';
import { Logout } from './components/Logout/Logout';
import { Workspace } from './components/Workspace/Workspace';
import { ApplicationPage } from './store/ApplicationStore';
import { Init } from './components/Logout/Init';

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
      case 'INIT_PAGE':
        return <Init />;
      default:
        return <Logout />;
    }
  };

  return getPage(page);
};
