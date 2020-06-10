import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { selectLogoutReason } from '../../store/Store';
import { ApplicationContext } from '../../context/ApplicationContext';

export const Logout = () => {
  const { logout } = useContext(ApplicationContext);
  const reason = useSelector(selectLogoutReason);

  const handleClick = () => {
    logout();
  };

  return (
    <div className="you-are-offline">
      You are offline: {reason}
      <a href="#" onClick={handleClick}>
        back to login
      </a>
    </div>
  );
};