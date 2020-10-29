import { Permission } from './roles/Permission';
import { UserActivity } from './UserActivity';
import { OwnerRole } from './roles/OwnerRole';
import { Role } from './roles/Role';
import { UserRoleNotFoundException } from '../exceptions/UserRoleNotFoundException';
import { UserRole } from './UserRole';
import { AgentRole } from './roles/AgentRole';
import { UserAuthentication } from './UserAuthenticationProvider';
import { Account } from './Account';
import { UserConfiguration } from './UserConfiguration';
import { UserDocument } from './documents/UserDocument';

export class User {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Set<string>;
  activity: UserActivity;
  account: Account;
  authentication: UserAuthentication;
  createdAt: Date;
  role: UserRole;

  constructor(
    id: string,
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    activity: UserActivity,
    account: Account,
    authentication: UserAuthentication,
    role: UserRole,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.profileImageUrl = profileImageUrl;
    this.tags = tags;
    this.activity = activity;
    this.account = account;
    this.authentication = authentication;
    this.role = role;
    this.createdAt = createdAt;
  }

  hasPermission(name: Permission): boolean {
    let role: Role | undefined;
    switch (this.role) {
      case UserRole.Owner:
        role = new OwnerRole();
        break;
      case UserRole.Agent:
        role = new AgentRole();
        break;
      default:
        throw new UserRoleNotFoundException();
    }

    return role.hasPermission(name);
  }

  toDocument(): UserDocument {
    return {
      id: this.id,
      name: this.name,
      profileImageUrl: this.profileImageUrl,
      tags: Array.from(this.tags),
      activity: this.activity,
      accountId: this.account.id,
      authentication: {
        provider: this.authentication.provider,
      },
      role: this.role,
    };
  }

  getConfiguration(): UserConfiguration | undefined {
    if (this.account.configuration) {
      return {
        inbound: this.account.configuration.inbound,
        outbound: this.account.configuration.outbound,
      };
    }
  }
}
