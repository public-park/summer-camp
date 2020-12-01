import { User } from '../models/User';
import { UserActivity } from '../models/UserActivity';
import { UserStore } from '../store/UserStore';

export enum UserActionType {
  ACTIVITY_CHANGE = 'USER_ACTIVITY_CHANGE',
  READY = 'USER_READY',
}

export interface ActivityAction {
  type: UserActionType;
  payload: UserActivity;
}

export const setActivity = (user: User): ActivityAction => {
  return {
    type: UserActionType.ACTIVITY_CHANGE,
    payload: user.activity,
  };
};

export interface ReadyAction {
  type: UserActionType;
  payload: UserStore;
}

export const setReady = (user: User): ReadyAction => {
  return {
    type: UserActionType.READY,
    payload: {
      id: user.id,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      tags: Array.from(user.tags),
      activity: user.activity,
      role: user.role,
      accountId: user.accountId,
    },
  };
};

export type UserAction = ActivityAction | ReadyAction;
