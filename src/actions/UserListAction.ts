import { UserPresenceDocument } from '../models/documents/UserDocument';
import { ActionType, UserListUpdateAction } from './Action';

export const updateList = (users: Array<UserPresenceDocument>): UserListUpdateAction => {
  return {
    type: ActionType.USERS_UPDATE,
    payload: users,
  };
};
