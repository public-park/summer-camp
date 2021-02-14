import { v4 as uuidv4 } from 'uuid';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { UserRepository } from '../UserRepository';
import { FileBaseRepository } from './FileBaseRepository';
import { UserActivity } from '../../models/UserActivity';
import { UserRole } from '../../models/UserRole';
import { UserAlreadyExistsException } from '../../exceptions/UserAlreadyExistsException';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { InvalidUserNameException } from '../../exceptions/InvalidUserNameException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { SamlUserAuthentication } from '../../security/authentication/SamlAuthenticationProvider';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';
import { UserDocument } from '../../models/documents/UserDocument';
import { UserConfiguration } from '../../models/UserConfiguration';

interface UserJsonDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: string[];
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  configuration: UserConfiguration;
  role: UserRole;
  createdAt: string;
}

const isValidUserDocument = (data: unknown) => {
  if (typeof data !== 'object') {
    return false;
  }

  if (
    !data ||
    !data.hasOwnProperty('id') ||
    !data.hasOwnProperty('name') ||
    !data.hasOwnProperty('tags') ||
    !data.hasOwnProperty('activity') ||
    !data.hasOwnProperty('accountId') ||
    !data.hasOwnProperty('authentication') ||
    !data.hasOwnProperty('role') ||
    !data.hasOwnProperty('createdAt')
  ) {
    return false;
  }

  return true;
};

export class FileUserRepository extends FileBaseRepository<User> implements UserRepository {
  users: Map<string, User>;

  constructor(fileName: string) {
    super(fileName);

    this.users = new Map();

    this.users = this.fromFile(this.load());
  }

  getById = async (id: string) => {
    return this.users.get(id);
  };

  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.users.values()).filter((user) => user.accountId == account.id);

    return Promise.resolve(
      list
        .map((user) => user)
        .filter((user, index) => index >= skip && index < limit)
        .reverse()
    );
  }

  save = async (user: User) => {
    if (!user.name) {
      throw new InvalidUserNameException();
    }

    const existing = await this.getByName(user.name);

    if (existing && existing.id !== user.id) {
      throw new UserAlreadyExistsException();
    }

    if (existing && existing.accountId !== user.accountId) {
      throw new InvalidAccountException();
    }

    this.users.set(user.id, user);

    await this.persist(this.toFile());

    return user;
  };

  remove = async (user: User) => {
    if (!(await this.getById(user.id))) {
      throw new UserNotFoundException();
    }

    this.users.delete(user.id);

    return this.persist(this.toFile());
  };

  getByName = async (name: string) => {
    for (const user of this.users.values()) {
      if (user.name === name) {
        return Promise.resolve(user);
      }
    }
  };

  getOneByAccount = async (account: Account) => {
    for (const user of this.users.values()) {
      if (user.accountId === account.id) {
        return Promise.resolve(user);
      }
    }
  };

  async getByNameId(account: Account, nameId: string) {
    for (const user of this.users.values()) {
      const authentication = user.authentication as SamlUserAuthentication;

      if (user.accountId === account.id) {
        return;
      }

      if (user.authentication && authentication.nameId === nameId) {
        return Promise.resolve(user);
      }
    }
  }

  protected toFile(): Array<UserDocument> {
    return Array.from(this.users.values()).map((user) => {
      return this.convertUserToDocument(user);
    });
  }

  protected convertUserToDocument(user: User): UserDocument {
    return user.toDocument();
  }

  protected fromFile(list: Array<unknown>): Map<string, User> {
    const users = new Map<string, User>();

    list.map((item) => {
      const user = this.convertDocumentToUser(item);

      users.set(user.id, user);
    });

    return users;
  }

  protected convertDocumentToUser(data: unknown): User {
    if (!isValidUserDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as UserJsonDocument;

    return new User(
      item.id,
      item.name,
      item.profileImageUrl,
      new Set(item.tags),
      item.activity,
      item.accountId,
      item.authentication,
      item.role,
      item.configuration,
      new Date(item.createdAt)
    );
  }

  create = async (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown,
    configuration?: UserConfiguration
  ) => {
    if (!name) {
      throw new InvalidUserNameException();
    }

    const user = new User(
      uuidv4(),
      name,
      profileImageUrl,
      tags,
      activity,
      accountId,
      authentication,
      role,
      configuration
    );

    return this.save(user);
  };
}
