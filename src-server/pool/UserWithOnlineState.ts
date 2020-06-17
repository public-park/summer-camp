import { UserActivity } from '../models/UserActivity';
import { User } from '../models/User';

export class UserWithOnlineState extends User {
  isOnACall: boolean;
  isOnline: boolean;

  constructor(user: User, isOnline: boolean) {
    super(
      user.id,
      user.name,
      user.profileImageUrl,
      user.tags,
      user.activity,
      user.accountId,
      user.authentication,
      user.role,
      user.createdAt
    );

    this.isOnACall = false;
    this.isOnline = isOnline;
  }

  get isAvailable(): boolean {
    return this.activity === UserActivity.WaitingForWork && !this.isOnACall;
  }
}
