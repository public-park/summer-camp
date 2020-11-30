import { UserActivity } from '../models/UserActivity';
import { UserRole } from '../models/UserRole';

export interface UserStore {
  id: string | undefined;
  name: string | undefined;
  profileImageUrl: string | undefined;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string | undefined;
  role: UserRole | undefined;
}
