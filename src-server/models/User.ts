import { UserPermissions } from './UserPermissions';
import { UserActivity } from './UserActivity';

export interface UserAuthentication {
  provider: string;
}

export class User {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  labels: Set<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  createdAt: Date;
  permissions: Set<UserPermissions>;

  constructor(
    id: string,
    name: string,
    profileImageUrl: string | undefined,
    labels: Set<string>,
    activity: UserActivity,
    accountId: string,
    permissions: Set<UserPermissions>,
    authentication: UserAuthentication,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.profileImageUrl = profileImageUrl;
    this.labels = labels;
    this.activity = activity;
    this.accountId = accountId;
    this.authentication = authentication;
    this.createdAt = createdAt;
    this.permissions = permissions;
  }

  hasPermission(name: UserPermissions): boolean {
    return this.permissions.has(name);
  }

  get isAvailable(): boolean {
    return this.activity === UserActivity.WaitingForWork;
  }

  toApiResponse(): any {
    return {
      ...this,
      labels: Array.from(this.labels),
      authentication: {
        provider: this.authentication.provider,
      },
      permissions: Array.from(this.permissions),
    };
  }
}
