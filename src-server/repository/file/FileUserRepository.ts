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
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { SamlUserAuthentication } from '../../security/authentication/SamlAuthenticationProvider';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';

interface UserDocument {
  id: string;
  name: string;
  profileImageUrl: string;
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

  getById = async (account: Account, id: string) => {
    const user = this.users.get(id);

    if (user && user.account.id === account.id) {
      return Promise.resolve(await this.getCopy(user));
    }
  };

  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const list: User[] = [];

    for (const user of this.users.values()) {
      if (user.account.id === account.id) {
        list.push(await this.getCopy(user));
      }
    }

    return Promise.resolve(list);
  }

  update = async (account: Account, user: User) => {
    if (!(await this.getById(account, user.id))) {
      throw new UserNotFoundException();
    }

    if (!user.name) {
      throw new InvalidUserNameException();
    }

    if (user.account.id !== account.id) {
      throw new InvalidAccountException();
    }

    const existingUser = await this.getByName(user.name);

    if (existingUser && existingUser.id !== user.id) {
      if (await this.getByName(user.name, account)) {
        throw new UserAlreadyExistsException();
      }
    }

    this.users.set(user.id, user);

    await this.persist(this.toPlainObjects());

    return await this.getCopy(user);
  };

  delete = async (account: Account, user: User) => {
    if (!(await this.getById(account, user.id))) {
      throw new UserNotFoundException();
    }

    this.users.delete(user.id);

    return this.persist(this.toPlainObjects());
  };

  getByName = async (name: string, account?: Account) => {
    for (const user of this.users.values()) {
      if (user.name === name) {
        return Promise.resolve(this.getCopy(user));
      }
    }
  };

  getAccountIdByName = async (name: string) => {
    for (const user of this.users.values()) {
      if (user.name === name) {
        return Promise.resolve(user.account.id);
      }
    }
  };

  getOneByAccount = async (account: Account) => {
    for (const user of this.users.values()) {
      if (user.account.id === account.id) {
        return Promise.resolve(this.getCopy(user));
      }
    }
  };

  async getByNameId(account: Account, nameId: string) {
    for (const user of this.users.values()) {
      const authentication = user.authentication as SamlUserAuthentication;

      if (user.account.id === account.id) {
        return;
      }

      if (user.authentication && authentication.nameId === nameId) {
        return Promise.resolve(this.getCopy(user));
      }
    }
  }

  protected async getCopy(user: User) {
    return await this.fromPlainObject(await this.toPlainObject(user));
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
      accountId: user.account.id,
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
      item.profileImageUrl,
      new Set(item.tags),
      item.activity,
      account,
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

    if (await this.getAccountIdByName(name)) {
      throw new UserAlreadyExistsException();
    }

    const user = new User(uuidv4(), name, profileImageUrl, tags, activity, account, authentication, role);

    this.users.set(user.id, user);

    await this.persist(this.toPlainObjects());

    return Promise.resolve(user);
  };
}
