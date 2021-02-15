import { UserRepository } from '../repository/UserRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { CallRepository } from '../repository/CallRepository';
import { CallMessage } from '../models/socket/messages/CallMessage';
import { UserMessage } from '../models/socket/messages/UserMessage';
import { Call } from '../models/Call';
import { AccountRepository } from '../repository/AccountRepository';

export class UserPoolManager {
  pool: Map<string, User>;
  calls: CallRepository;
  users: UserRepository;
  accounts: AccountRepository;

  constructor(accounts: AccountRepository, users: UserRepository, calls: CallRepository) {
    this.pool = new Map();
    this.accounts = accounts;
    this.users = users;
    this.calls = calls;

    this.calls.onLifecycleEvent((call) => {
      const user = this.getUser(call);

      if (user) {
        user.call = call.isActive() ? call : undefined;

        this.broadcastToAccount(user);
        user.broadcast(new CallMessage(call));
      }
    });
  }

  getUser(call: Call): User | undefined {
    if (!call.userId) {
      return;
    }

    const user = this.getById(call.userId);

    if (!user) {
      return;
    }

    return user;
  }

  async broadcastToAccount(user: User) {
    this.getAll(await user.getAccount()).forEach((it) => it.broadcast(new UserMessage(user)));
  }

  async add(user: User): Promise<User> {
    this.pool.set(user.id, user);

    this.broadcastToAccount(user);

    return user;
  }

  updateIfExists(user: User) {
    let it = this.getById(user.id);

    if (it) {
      this.pool.set(user.id, user);

      this.broadcastToAccount(user);
    } else {
      throw new UserNotFoundException(); // TODO FIX
    }
  }

  delete(user: User) {
    user.sockets.close(1006);

    this.pool.delete(user.id);

    this.broadcastToAccount(user);
  }

  deleteById(id: string) {
    const user = this.getById(id);

    if (user) {
      this.delete(user);
    }
  }

  getById(id: string): User | undefined {
    return this.pool.get(id);
  }

  getByIdOrFail(id: string) {
    const user = this.getById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async getByIdWithFallback(id: string): Promise<User | undefined> {
    let User = this.getById(id);

    if (User) {
      return User;
    } else {
      const user = await this.users.getById(id);

      return user;
    }
  }

  async getOneByAccount(account: Account): Promise<User | undefined> {
    const users = this.getAll(account);

    if (users.length !== 0) {
      return Promise.resolve(users[0]);
    }
  }

  async getOneByAccountWithFallback(account: Account): Promise<User | undefined> {
    const user = this.getOneByAccount(account);

    if (user) {
      return Promise.resolve(user);
    } else {
      const user = await this.users.getOneByAccount(account);

      if (!user) {
        throw new UserNotFoundException();
      }

      return user;
    }
  }

  getAll(account: Account): Array<User> {
    return Array.from(this.pool.values()).filter((user) => user.accountId === account.id);
  }

  async getAllWithFallback(account: Account): Promise<Array<User>> {
    const offline = (await this.users.getAll(account)).filter((user) => !this.pool.has(user.id));

    let online = Array.from(this.pool.values()).filter((user) => user.accountId === account.id);

    return online.concat(offline);
  }

  getSize() {
    return this.pool.size;
  }
}
