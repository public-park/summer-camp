import { Button } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setView } from '../../../actions/WorkspaceAction';
import { selectUser, selectUserList } from '../../../store/Store';
import { UserItem } from './UserItem';

export const UserListView = () => {
  const user = useSelector(selectUser);
  const users = useSelector(selectUserList);

  const dispatch = useDispatch();

  const list = Array.from(users.values()).sort((a, b) => {
    let fa = a.name.toLowerCase();
    let fb = b.name.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  return (
    <div className="users">
      <div className="button-wrapper">
        {user.role === 'owner' && (
          <div className="create-user-button">
            <Button onClick={() => dispatch(setView('USER_SETUP_VIEW'))} variant="contained" color="primary">
              Add User
            </Button>
          </div>
        )}
      </div>
      <div className="list-wrapper">
        {list.map((it) => {
          return it.id !== user?.id ? <UserItem key={it.id} user={it} /> : undefined;
        })}
      </div>
    </div>
  );
};
