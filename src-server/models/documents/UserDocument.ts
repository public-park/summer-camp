import { CallDirection } from '../CallDirection';
import { CallStatus } from '../CallStatus';
import { UserActivity } from '../UserActivity';
import { UserRole } from '../UserRole';

export interface UserDocument {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string;
  authentication: {
    provider: string;
  };
  role: UserRole;
}

export interface PresenceDocument {
  isOnline: boolean;
  isAvailable: boolean;
  activity: UserActivity;
  call: {
    id: string;
    from: string;
    to: string;
    status: CallStatus;
    direction: CallDirection;
  } | null;
}

export interface UserWithPresenceDocument extends PresenceDocument {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Array<string>;
  accountId: string;
  role: UserRole;
}
