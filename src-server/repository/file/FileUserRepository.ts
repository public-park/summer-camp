import { v4 as uuidv4 } from 'uuid';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { UserRepository } from '../UserRepository';
import { FileBaseRepository } from './FileBaseRepository';
import { UserActivity } from '../../models/UserActivity';
import { AccountRepository } from '../AccountRepository';
import { UserRole } from '../../models/UserRole';
import { UserAlreadyExistsException } from '../../exceptions/UserAlreadyExistsException';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { log } from '../../logger';
import { InvalidUserNameException } from '../../exceptions/InvalidUserNameException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { SamlUserAuthentication } from '../../security/authentication/SamlAuthenticationProvider';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';

interface UserDocument {
  id: string;
  name: string;
  profileImageUrl: string | null;
  tags: string[];
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
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
  accounts: AccountRepository;

  constructor(accounts: AccountRepository, fileName: string) {
    super(fileName);

    this.users = new Map();
    this.accounts = accounts;

    this.fromPlainObjects(this.load())
      .then((users) => {
        this.users = users;
      })
      .catch((error) => log.error(error));
  }

  setAccountRepository(repository: AccountRepository) {
    this.accounts = repository;
  }

  getById = async (id: string) => {
    return this.users.get(id);
  };

  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const list: User[] = [];

    for (const user of this.users.values()) {
      if (user.accountId === account.id) {
        list.push(user);
      }
    }

    return Promise.resolve(list);
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

    await this.persist(this.toPlainObjects());

    return user;
  };

  remove = async (user: User) => {
    if (!(await this.getById(user.id))) {
      throw new UserNotFoundException();
    }

    this.users.delete(user.id);

    return this.persist(this.toPlainObjects());
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

  protected toPlainObjects(): Array<UserDocument> {
    return Array.from(this.users.values()).map((user) => {
      return this.toPlainObject(user);
    });
  }

  protected toPlainObject(user: User): UserDocument {
    return {
      id: user.id,
      name: user.name,
      profileImageUrl: user.profileImageUrl || '',
      tags: Array.from(user.tags.values()),
      activity: user.activity,
      accountId: user.accountId,
      authentication: user.authentication,
      role: user.role,
      createdAt: user.createdAt.toString(),
    };
  }

  protected async fromPlainObjects(list: Array<unknown>): Promise<Map<string, User>> {
    const users = new Map<string, User>();

    await Promise.all(
      list.map(async (item) => {
        const user = await this.fromPlainObject(item);

        users.set(user.id, user);
      })
    );

    return users;
  }

  protected async fromPlainObject(data: unknown): Promise<User> {
    if (!isValidUserDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as UserDocument;

    const account = await this.accounts.getById(item.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    return new User(
      item.id,
      item.name,
      item.profileImageUrl || undefined,
      new Set(item.tags),
      item.activity,
      account.id,
      item.authentication,
      item.role,
      new Date(item.createdAt)
    );
  }

  create = async (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    account: Account,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown
  ) => {
    if (!name) {
      throw new InvalidUserNameException();
    }

    if (!account) {
      throw new AccountNotFoundException();
    }
    const user = new User(uuidv4(), name, profileImageUrl, tags, activity, account.id, authentication, role);

    return this.save(user);
  };
}
