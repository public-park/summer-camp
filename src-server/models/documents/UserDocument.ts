import { CallDirection } from '../CallDirection';
import { CallStatus } from '../CallStatus';
import { UserActivity } from '../UserActivity';
import { UserAuthentication } from '../UserAuthenticationProvider';
import { UserRole } from '../UserRole';

export interface UserDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: Array<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  role: UserRole;
  createdAt: Date;
}

export interface UserDocumentWithoutAuthentication extends Omit<UserDocument, 'authentication'> {}

export interface PresenceDocument {
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

export interface UserWithPresenceDocument extends PresenceDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: Array<string>;
  accountId: string;
  role: UserRole;
}
