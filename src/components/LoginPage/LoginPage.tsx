import React, { useState } from 'react';
import { CardContent, Typography, Paper, Tabs, Tab } from '@material-ui/core';
import { version } from '../../../package.json';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';

export const LoginPage = () => {
  const [title, setTitle] = useState('Already signed up?');
  const [tab, setTab] = useState('login');

  const handleTabChange = () => {
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
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>

          <Paper variant="outlined" style={{ marginTop: '25px' }}>
            <Tabs value={tab} indicatorColor="primary" textColor="primary" onChange={handleTabChange}>
              <Tab value="login" label="Login" />
              <Tab value="register" label="Register" />
            </Tabs>

            <LoginView isVisible={tab === 'login'} />
            <RegisterView isVisible={tab === 'register'} />
          </Paper>

          <span
            className="version"
            style={{ fontSize: '0.8em', paddingBottom: '10px', display: 'block', position: 'absolute', bottom: '0' }}
          >
            Summer Camp {version}
          </span>
        </CardContent>
      </div>
    </div>
  );
};
