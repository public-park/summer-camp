import { UserRepository } from '../repository/UserRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';
import { CallRepository } from '../repository/CallRepository';
import { CallMessage } from '../models/socket/messages/CallMessage';
import { CallStatus } from '../models/CallStatus';
import { CallDirection } from '../models/CallDirection';
import { UserMessage } from '../models/socket/messages/UserMessage';
import { Call } from '../models/Call';
import { UserWithSocket } from '../models/UserWithSocket';
import { AccountRepository } from '../repository/AccountRepository';

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

        this.sendToAccount(user);
        this.sendCallStateToUser(user, user.call);
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

  sendCallStateToUser(user: UserWithSocket, call: Call | undefined): void {
    user.broadcast(new CallMessage(call));
  }

  async sendToAccount(user: UserWithSocket) {
    this.getAll(user.account).forEach((it) => it.broadcast(new UserMessage(user)));
  }

  async add(user: UserWithSocket): Promise<UserWithSocket> {
    this.pool.set(user.id, user);

    this.sendToAccount(user);

    return user;
  }

  updateIfExists(user: UserWithSocket) {
    let it = this.getById(user.id);

    if (it) {
      this.pool.set(user.id, user);

      this.sendToAccount(user);
    } else {
      throw new UserNotFoundException();
    }
  }

  delete(user: UserWithSocket) {
    user.sockets.close(1006);

    this.pool.delete(user.id);

    this.sendToAccount(user);
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
        const account = (await this.accounts.getById(user.accountId)) as Account;

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

  getUserWithSocket = async (user: User, sockets: Array<WebSocketWithKeepAlive> = []): Promise<UserWithSocket> => {
    const account = (await this.accounts.getById(user.accountId)) as Account;

    return new UserWithSocket(account, user, sockets, this.users);
  };

  getSize = () => {
    return this.pool.size;
  };
}
