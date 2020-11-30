import { UserActivity } from '../models/UserActivity';
import { UserStore } from './UserStore';

export const DefaultUserStore: UserStore = {
  id: undefined,
  name: undefined,
  profileImageUrl: undefined,
  tags: [],
  activity: UserActivity.Unknown,
  role: undefined,
  accountId: undefined,
};
