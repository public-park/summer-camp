import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { UserActivity } from '../models/UserActivity';

const handle = async (user: UserWithOnlineState, activity: UserActivity) => {
  user.activity = activity;

  user.persist();

  return { activity: activity };
};

export const ActivityCommandHandler = {
  handle,
};
