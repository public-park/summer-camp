import { Alert, AlertTitle } from '@material-ui/lab';
import React from 'react';
import { getUrl } from '../../helpers/UrlHelper';

const showWarning = () => {
  return (
    <Alert severity="error" style={{ marginTop: '10px' }}>
      <AlertTitle>REACT_APP_SERVER_URL not set</AlertTitle>
      <strong>NODE_ENV</strong> is set to <strong>{process.env.NODE_ENV}</strong>,{' '}
      <span>
        the environment variable <strong>REACT_APP_SERVER_URL</strong> is not configured, this frontend will try to
        connect to <strong>{getUrl()}</strong>.
      </span>
    </Alert>
  );
};

const showNotification = () => {
  return (
    <Alert severity="info" style={{ marginTop: '10px' }}>
      <AlertTitle>Development Mode</AlertTitle>
      <strong>NODE_ENV</strong> is set to <strong>{process.env.NODE_ENV}</strong>, this frontend will try to connect to{' '}
      <strong>{getUrl()}</strong>, you can change this by updating <strong>REACT_APP_SERVER_URL</strong> in your{' '}
      <strong>.env</strong> file.
    </Alert>
  );
};

export const DevelopmentModeNotification = () => {
  return process.env.REACT_APP_SERVER_URL ? showNotification() : showWarning();
};
