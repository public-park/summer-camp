import React from 'react';
import Alert from '@material-ui/lab/Alert';

export const ConnectionLostWithReconnectAlert = () => {
  return (
    <div className="connection-lost-alert-badge">
      <Alert variant="filled" severity="error">
        You are not connected, incoming phone calls will not be connected to you anymore.
      </Alert>
    </div>
  );
};
