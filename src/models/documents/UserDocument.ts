import { CallDirection } from '../CallDirection';
import { CallStatus } from '../CallStatus';
import { UserActivity } from '../UserActivity';
import { UserRole } from '../UserRole';

export interface UserDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string;
  role: UserRole;
  createdAt: Date;
}

export interface UserPresenceDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: Array<string>;
  accountId: string;
  role: UserRole;
  isOnline: boolean;
  isAvailable: boolean;
  activity: UserActivity;
  call?: {
    id: string;
    from: string;
    to: string;
    status: CallStatus;
    direction: CallDirection;
  };
}
