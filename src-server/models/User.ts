import { Permission } from './roles/Permission';
import { UserActivity } from './UserActivity';
import { OwnerRole } from './roles/OwnerRole';
import { Role } from './roles/Role';
import { UserRoleNotFoundException } from '../exceptions/UserRoleNotFoundException';
import { UserRole } from './UserRole';
import { Account } from './Account';
import { AgentRole } from './roles/AgentRole';
import { UserConfiguration } from './UserConfiguration';
import { UserDocument } from './documents/UserDocument';
import { UserAuthentication } from './UserAuthenticationProvider';
import { PhoneConfigurationDocument } from './documents/PhoneConfigurationDocument';
import { AccountConfiguration } from './AccountConfiguration';
import { PhoneDirection } from '../types';

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
    this.configuration = configuration;
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
    const payload: UserDocument = {
      id: this.id,
      name: this.name,
      tags: Array.from(this.tags),
      activity: this.activity,
      accountId: this.accountId,
      authentication: this.authentication,
      role: this.role,
      createdAt: this.createdAt,
    };

    if (this.profileImageUrl) {
      payload.profileImageUrl = this.profileImageUrl;
    }

    return payload;
  }

  toDocumentWithoutAuthentication(): Omit<UserDocument, 'authentication'> {
    const { authentication, ...document } = this.toDocument();

    return document;
  }

  getPhoneConfiguration(account: Account): PhoneConfigurationDocument {
    const configuration: PhoneConfigurationDocument = {
      direction: this.getPhoneDirection(account.configuration),
      callerIds: [],
      constraints: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: true,
      },
    };

    if (account.configuration?.outbound.isEnabled && account.configuration.outbound.phoneNumber) {
      configuration.callerIds = [account.configuration.outbound.phoneNumber];
    }

    return configuration;
  }

  getPhoneDirection(configuration: AccountConfiguration | undefined): PhoneDirection {
    if (!configuration) {
      return 'none';
    }

    if (configuration.outbound.isEnabled && configuration.inbound.isEnabled) {
      return 'both';
    }

    if (configuration.outbound.isEnabled) {
      return 'outbound';
    }

    if (configuration.inbound.isEnabled) {
      return 'inbound';
    }

    return 'none';
  }
}
