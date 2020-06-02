import React, { useContext } from 'react';
import Alert from '@material-ui/lab/Alert';
import { ApplicationContext } from '../../context/ApplicationContext';

export const ConnectionLostAlertBadge = () => {
  const { logout } = useContext(ApplicationContext);

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    logout();
  };

  return (
    <div className="connection-lost-alert-badge">
      <Alert variant="filled" severity="error">
        You are not connected, incoming phone calls will not be connected to you anymore.
        <div>
          <a href="#" onClick={handleLogout} style={{ color: 'white' }}>
            return to login
          </a>
        </div>
      </Alert>
    </div>
  );
};
