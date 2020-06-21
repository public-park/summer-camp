import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../BaseRepository';
import { User, UserAuthentication } from '../../models/User';
import { UserRepository } from '../UserRepository';
import { FileBaseRepository } from './FileBaseRepository';
import { UserActivity } from '../../models/UserActivity';
import { UserNotFoundError } from '../UserNotFoundError';
import { UserNameError } from '../UserNameError';
import { AccountRepository } from '../AccountRepository';
import { AccountNotFoundError } from '../AccountNotFoundError';
import { UserRole } from '../../models/UserRole';
import { UserAlreadyExistsException } from '../../exceptions/UserAlreadyExistsException';

export class FileUserRepository extends FileBaseRepository<User> implements UserRepository, BaseRepository<User> {
  users: Map<string, User>;
  accountRepository: AccountRepository;

  constructor(fileName: string, accountRepository: AccountRepository) {
    super(fileName);

    this.accountRepository = accountRepository;

    this.users = this.fromPlainObjects(this.load());
  }

  getById = async (id: string) => {
    const user = this.users.get(id);

    if (user) {
      return Promise.resolve(this.getCopy(user));
    }
  };

  getAll = async () => {
    const list: User[] = [];

    for (const user of this.users.values()) {
      list.push(this.getCopy(user));
    }

    return Promise.resolve(list);
  };

  update = async (user: User) => {
    if (!(await this.getById(user.id))) {
      throw new UserNotFoundError();
    }
    if (!(await this.accountRepository.getById(user.accountId))) {
      throw new AccountNotFoundError();
    }

    if (user.name === '') {
      throw new UserNameError();
    }

    const existingUser = await this.getById(user.id);

    if (existingUser && existingUser.name !== user.name) {
      if (await this.getByName(user.name)) {
        throw new UserAlreadyExistsException();
      }
    }

    this.users.set(user.id, user);

    await this.persist(this.toPlainObjects());

    return Promise.resolve(<User>this.getCopy(user));
  };

  delete = async (user: User) => {
    if (!(await this.getById(user.id))) {
      throw new UserNotFoundError();
    }

    this.users.delete(user.id);

    return this.persist(this.toPlainObjects());
  };

  getByName = async (name: string) => {
    for (const user of this.users.values()) {
      if (user.name === name) {
        return Promise.resolve(this.getCopy(user));
      }
    }
  };

  getOneByAccountId = async (id: string) => {
    for (const user of this.users.values()) {
      if (user.accountId === id) {
        return Promise.resolve(this.getCopy(user));
      }
    }
  };

  protected getCopy(user: User) {
    return this.fromPlainObject(this.toPlainObject(user));
  }

  protected toPlainObjects(): Array<User> {
    return Array.from(this.users.values()).map((user) => {
      return this.toPlainObject(user);
    });
  }

  protected toPlainObject(user: User): any {
    return {
      id: user.id,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      tags: Array.from(user.tags.values()),
      activity: user.activity,
      accountId: user.accountId,
      authentication: user.authentication,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  protected fromPlainObjects(list: Array<any>): Map<string, User> {
    const users = new Map<string, User>();

    list.map((item) => {
      users.set(item.id, this.fromPlainObject(item));
    });

    return users;
  }

  protected fromPlainObject(item: any): User {
    return new User(
      item.id,
      item.name,
      item.profileImageUrl,
      new Set(item.tags),
      item.activity,
      item.accountId,
      item.authentication,
      item.role,
      item.createdAt
    );
  }

  create = async (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown
  ) => {
    if (name === '') {
      throw new UserNameError();
    }

    if (!accountId) {
      throw new Error();
    }

    if (await this.getByName(name)) {
      throw new UserNotFoundError();
    }

    if (!(await this.accountRepository.getById(accountId))) {
      throw new AccountNotFoundError();
    }

    const user = new User(uuidv4(), name, profileImageUrl, tags, activity, accountId, authentication, role);

    this.users.set(user.id, user);

    await this.persist(this.toPlainObjects());

    return Promise.resolve(user);
  };
}
