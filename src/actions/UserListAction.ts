import { UserWithPresenceDocument } from '../models/documents/UserDocument';
import { ActionType } from './ActionType';

export const updateUserList = (users: Array<UserWithPresenceDocument>) => {
  return {
    type: ActionType.USER_LIST_UPDATE,
    payload: users,
  };
};
