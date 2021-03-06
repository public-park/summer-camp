import { Permission } from './roles/Permission';
import { UserActivity } from './UserActivity';
import { OwnerRole } from './roles/OwnerRole';
import { Role } from './roles/Role';
import { UserRoleNotFoundException } from '../exceptions/UserRoleNotFoundException';
import { UserRole } from './UserRole';
import { Account } from './Account';
import { AgentRole } from './roles/AgentRole';
import { UserConfiguration } from './UserConfiguration';
import { UserDocument, UserPresenceDocument } from './documents/UserDocument';
import { UserAuthentication } from './UserAuthenticationProvider';
import { PhoneConfigurationDocument } from './documents/PhoneConfigurationDocument';
import { AccountConfiguration } from './AccountConfiguration';
import { PhoneDirection } from '../types';
import { UserSockets } from './UserSockets';
import { Call } from './Call';
import { repository } from '../worker';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';

export class User {
  id: string;
  name: string;
  profileImageUrl: string | undefined;
  tags: Set<string>;
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  configuration: UserConfiguration | undefined;
  createdAt: Date;
  role: UserRole;

  call: Call | undefined;
  private account: Account | undefined;
  sockets: UserSockets;

  constructor(
    id: string,
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    activity: UserActivity,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    configuration: UserConfiguration | undefined,
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

    this.call = undefined;
    this.account = undefined;
    this.sockets = new UserSockets();
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
      createdAt: this.createdAt.toUTCString(),
    };

    if (this.profileImageUrl) {
      payload.profileImageUrl = this.profileImageUrl;
    }

    if (this.configuration) {
      payload.configuration = this.configuration;
    }

    return payload;
  }

  toDocumentWithoutAuthentication(): Omit<UserDocument, 'authentication'> {
    const { authentication, ...document } = this.toDocument();

    return document;
  }

  toPresenceDocument(): UserPresenceDocument {
    const { id, name, profileImageUrl, tags, accountId, role } = this.toDocument();

    const response: UserPresenceDocument = {
      id,
      name,
      profileImageUrl,
      tags,
      accountId,
      role,
      activity: this.activity,
      isOnline: this.isOnline,
      isAvailable: this.isAvailable,
    };

    if (this.call) {
      response.call = {
        ...this.call.toStatusDocument(),
      };
    }

    return response;
  }

  broadcast(payload: object) {
    this.sockets.broadcast(JSON.stringify(payload));
  }

  async getPhoneConfiguration(): Promise<PhoneConfigurationDocument> {
    const account = await this.getAccount();

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

    if (this.configuration) {
      configuration.constraints = this.configuration.phone.constraints;
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

  get isAvailable(): boolean {
    return this.activity === UserActivity.WaitingForWork && !this.call;
  }

  get isOnline(): boolean {
    return this.sockets.length() > 0;
  }

  async getAccount(): Promise<Account> {
    this.account = await repository.accounts.getById(this.accountId);

    if (!this.account) {
      throw new AccountNotFoundException();
    }

    return this.account;
  }
}
