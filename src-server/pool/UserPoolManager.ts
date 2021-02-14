import { UserRepository } from '../repository/UserRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';
import { CallRepository } from '../repository/CallRepository';
import { CallMessage } from '../models/socket/messages/CallMessage';
import { UserMessage } from '../models/socket/messages/UserMessage';
import { Call } from '../models/Call';
import { UserWithSocket } from '../models/UserWithSocket';
import { AccountRepository } from '../repository/AccountRepository';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';

export class UserPoolManager {
  pool: Map<string, UserWithSocket>;
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

  getUser(call: Call): UserWithSocket | undefined {
    if (!call.userId) {
      return;
    }

    const user = this.getById(call.userId);

    if (!user) {
      return;
    }

    return user;
  }

  async broadcastToAccount(user: UserWithSocket) {
    this.getAll(user.account).forEach((it) => it.broadcast(new UserMessage(user)));
  }

  async add(user: UserWithSocket): Promise<UserWithSocket> {
    this.pool.set(user.id, user);

    this.broadcastToAccount(user);

    return user;
  }

  updateIfExists(user: UserWithSocket) {
    let it = this.getById(user.id);

    if (it) {
      this.pool.set(user.id, user);

      this.broadcastToAccount(user);
    } else {
      throw new UserNotFoundException(); // TODO FIX
    }
  }

  delete(user: UserWithSocket) {
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

  getById(id: string): UserWithSocket | undefined {
    return this.pool.get(id);
  }

  getByIdOrFail(id: string) {
    const user = this.getById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async getByIdWithFallback(id: string): Promise<UserWithSocket | undefined> {
    let UserWithSocket = this.getById(id);

    if (UserWithSocket) {
      return UserWithSocket;
    } else {
      const user = await this.users.getById(id);

      if (user) {
        return this.getUserWithSocket(user);
      }
    }
  }

  async getOneByAccount(account: Account): Promise<UserWithSocket | undefined> {
    const users = this.getAll(account);

    if (users.length !== 0) {
      return Promise.resolve(users[0]);
    }
  }

  async getOneByAccountWithFallback(account: Account): Promise<UserWithSocket | undefined> {
    const user = this.getOneByAccount(account);

    if (user) {
      return Promise.resolve(user);
    } else {
      const user = await this.users.getOneByAccount(account);

      if (!user) {
        throw new UserNotFoundException();
      }

      return this.getUserWithSocket(user);
    }
  }

  getAll(account: Account): Array<UserWithSocket> {
    return Array.from(this.pool.values()).filter((user) => user.accountId === account.id);
  }

  async getAllWithFallback(account: Account): Promise<Array<UserWithSocket>> {
    const offline = (await this.users.getAll(account)).filter((user) => !this.pool.has(user.id));

    const onlineWithSocket = await Promise.all(offline.map(async (user) => await this.getUserWithSocket(user)));

    let online = Array.from(this.pool.values()).filter((user) => user.accountId === account.id);

    return online.concat(onlineWithSocket);
  }

  async getUserWithSocket(user: User, sockets: Array<WebSocketWithKeepAlive> = []): Promise<UserWithSocket> {
    const account = await this.accounts.getById(user.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    return new UserWithSocket(account, user, sockets, this.users);
  }

  getSize() {
    return this.pool.size;
  }
}
