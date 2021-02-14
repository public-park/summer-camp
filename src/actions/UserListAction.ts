import { UserPresenceDocument } from '../models/documents/UserDocument';
import { ActionType, UserListUpdateAction } from './Action';

export const updateUserList = (users: Array<UserPresenceDocument>): UserListUpdateAction => {
  return {
    type: ActionType.USERS_LIST_UPDATE,
    payload: users,
  };
};
