import { Permission } from './roles/Permission';
import { UserActivity } from './UserActivity';
import { OwnerRole } from './roles/OwnerRole';
import { Role } from './roles/Role';
import { UserRoleNotFoundException } from '../exceptions/UserRoleNotFoundException';
import { UserRole } from './UserRole';
import { AgentRole } from './roles/AgentRole';

export interface UserAuthentication {
  provider: string;
}

export class User {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Set<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  createdAt: Date;
  role: UserRole;

  constructor(
    id: string,
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    activity: UserActivity,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.profileImageUrl = profileImageUrl;
    this.tags = tags;
    this.activity = activity;
    this.accountId = accountId;
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

  toApiResponse(): any {
    return {
      ...this,
      tags: Array.from(this.tags),
      authentication: {
        provider: this.authentication.provider,
      },
    };
  }
}
