import { ActionType } from './ActionType';
import { User } from '../models/User';
import { UserActivity } from '../models/enums/UserActivity';
import { UserConnectionState } from '../models/enums/UserConnectionState';

export interface UserAction {
  type: ActionType;
  payload: UserActionPayload;
}

interface UserActionPayload {
  user: {
    id: string | undefined;
    name: string | undefined;
    profileImageUrl: string | undefined;
    labels: string[];
    activity: UserActivity;
    connectionState: UserConnectionState;
  };
}

const toPlainObject = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    profileImageUrl: user.profileImageUrl,
    labels: Array.from(user.labels),
    activity: user.activity,
    connectionState: user.connection.state,
  };
};

export const setActivity = (user: User): UserAction => {
  return {
    type: ActionType.USER_ACTIVITY_CHANGED,
    payload: {
      user: toPlainObject(user),
    },
  };
};

export const setConnectionState = (user: User): UserAction => {
  return {
    type: ActionType.USER_CONNECTION_STATE_CHANGED,
    payload: {
      user: toPlainObject(user),
    },
  };
};

export const setLogout = (reason?: string) => {
  return {
    type: ActionType.USER_LOGOUT,
    payload: { reason: reason },
  };
};

export const setLogin = (token: string) => {
  return {
    type: ActionType.USER_LOGIN,
    payload: { token: token },
  };
};
