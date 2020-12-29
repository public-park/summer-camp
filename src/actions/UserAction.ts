import { User } from '../models/User';
import { ActionType, UserActivityAction, UserReadyAction } from './Action';

export const setActivity = (user: User): UserActivityAction => {
  return {
    type: ActionType.USER_ACTIVITY_CHANGE,
    payload: user.activity,
  };
};

export const setReady = (user: User): UserReadyAction => {
  return {
    type: ActionType.USER_READY,
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
