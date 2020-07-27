import React from 'react';
import Alert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../../../actions/NotificationAction';
import { selectWorkspaceNotification } from '../../../store/Store';

export const NotificationLayer = () => {
  const dispatch = useDispatch();

  const notification = useSelector(selectWorkspaceNotification);

  const handleClose = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    dispatch(hideNotification());

    e.preventDefault();
  };

  return (
    <div className="connection-lost-alert-badge">
      <Alert variant="filled" severity="error">
        {notification}
        <div>
          <a href="#/" onClick={handleClose}>
            close
          </a>
        </div>
      </Alert>
    </div>
  );
};
