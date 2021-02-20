import { CallDirection } from '../CallDirection';
import { CallStatus } from '../CallStatus';
import { UserActivity } from '../UserActivity';
import { UserAuthentication } from '../UserAuthenticationProvider';
import { UserRole } from '../UserRole';
import { UserConfigurationDocument } from './UserConfigurationDocument';

export interface UserDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  configuration?: UserConfigurationDocument;
  role: UserRole;
  createdAt: string;
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
