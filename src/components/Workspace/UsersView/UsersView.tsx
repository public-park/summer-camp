import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { selectTeam } from '../../../store/Store';
import { UserItem } from './UserItem';

export const UsersView = () => {
  const { user } = useContext(ApplicationContext);

  const users = useSelector(selectTeam);

  return (
    <div className="users">
      {[...users.values()].map((it) => {
        return it.id !== user?.id ? <UserItem key={it.id} user={it} /> : undefined;
      })}
    </div>
  );
};
