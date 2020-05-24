import React from 'react';
import { Link } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';

export const ConnectionLostAlertBadge = () => {
  return (
    <div className="connection-lost-alert-badge">
      <Alert variant="filled" severity="error">
        You are not connected, incoming phone calls will not be connected to you anymore.
        <div>
          {' '}
          <Link to="/" style={{ color: 'white' }}>
            return to login
          </Link>
        </div>
      </Alert>
    </div>
  );
};
