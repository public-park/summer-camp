import React, { useState } from 'react';
import { CardContent, Typography, Paper, Tabs, Tab } from '@material-ui/core';
import { version } from '../../../package.json';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { SamlRedirect } from './SamlRedirect';
import { DevelopmentModeNotification } from './DevelopmentModeNotification';

export const Login = () => {
  const [title, setTitle] = useState('Already signed up?');
  const [tab, setTab] = useState('login');

  const changeTab = () => {
    if (tab === 'login') {
      setTitle('New here?');
      setTab('register');
    } else {
      setTitle('Already signed up?');
      setTab('login');
    }
  };

  return (
    <div className="page-body-login">
      <div>
        <CardContent>
          {process.env.REACT_APP_AUTHENTICATION_MODE !== 'saml' && (
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
          )}

          {process.env.REACT_APP_AUTHENTICATION_MODE === 'saml' ? (
            <SamlRedirect />
          ) : (
            <Paper variant="outlined" style={{ marginTop: '25px' }}>
              <Tabs
                className="intro-tabs"
                value={tab}
                indicatorColor="primary"
                textColor="primary"
                onChange={changeTab}
              >
                <Tab className="login" value="login" label="Login" />
                {process.env.REACT_APP_AUTHENTICATION_MODE === 'local-password-with-registration' && (
                  <Tab className="register" value="register" label="Register" />
                )}
              </Tabs>
              <LoginForm isVisible={tab === 'login'} />
              {process.env.REACT_APP_AUTHENTICATION_MODE === 'local-password-with-registration' && (
                <RegisterForm isVisible={tab === 'register'} />
              )}
            </Paper>
          )}

          {process.env.NODE_ENV === 'development' && <DevelopmentModeNotification />}

          <span className="version">Summer Camp {version}</span>
        </CardContent>
      </div>
    </div>
  );
};
