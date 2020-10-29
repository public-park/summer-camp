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

export class UserPoolManager {
  pool: Map<string, UserWithSocket>;
  calls: CallRepository;
  users: UserRepository;

  constructor(users: UserRepository, calls: CallRepository) {
    this.pool = new Map();
    this.users = users;
    this.calls = calls;

    this.calls.onUpdate((call) => {
      const user = this.getUser(call);

      if (user) {
        this.broadcastCallStatusToUser(user);
        this.broadcast(user);
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

    user.call = call.isActive() ? call : undefined;

    return user;
  }

  broadcastCallStatusToUser(user: UserWithSocket): void {
    /* state was already published by message handler */
    if (user.call && user.call.status === CallStatus.Initiated && user.call.direction === CallDirection.Outbound) {
      return;
    }

    user.broadcast(new CallMessage(user.call));
  }

  async broadcast(user: UserWithSocket) {
    this.getAll(user.account).forEach((it) => it.broadcast(new UserMessage(user)));
  }

  async add(user: UserWithSocket): Promise<UserWithSocket> {
    this.pool.set(user.id, user);

    this.broadcast(user);

    return user;
  }

  updateIfExists(user: UserWithSocket) {
    let it = this.getById(user.id);

    if (it) {
      this.pool.set(user.id, this.getUserWithSocket(user, it.sockets.get()));

      this.broadcast(user);
    } else {
      throw new UserNotFoundException();
    }
  }

  delete(user: UserWithSocket) {
    user.sockets.close(1006);

    this.pool.delete(user.id);

    this.broadcast(user);
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

  async getByIdWithFallback(account: Account, id: string): Promise<UserWithSocket | undefined> {
    let UserWithSocket = this.getById(id);

    if (UserWithSocket) {
      return UserWithSocket;
    } else {
      const user = await this.users.getById(account, id);

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
    return Array.from(this.pool.values()).filter((user) => user.account.id === account.id);
  }

  getUserWithSocket = (user: User, sockets: Array<WebSocketWithKeepAlive> = []): UserWithSocket => {
    return new UserWithSocket(user, sockets, this.users);
  };

  getSize = () => {
    return this.pool.size;
  };
}
