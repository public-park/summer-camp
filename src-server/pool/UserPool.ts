import { UserWithOnlineState } from './UserWithOnlineState';
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

export class UserPool {
  pool: Map<string, UserWithOnlineState>;
  calls: CallRepository;
  users: UserRepository;

  constructor(users: UserRepository, calls: CallRepository) {
    this.pool = new Map();
    this.users = users;
    this.calls = calls;

    this.calls.onUpdate((call) => {
      const user = this.broadcastCallStatus(call);

      if (user) {
        this.broadcastToAll(user);
      }
    });
  }

  broadcastCallStatus(call: Call): UserWithOnlineState | undefined {
    if (!call.userId) {
      return;
    }

    const user = this.getById(call.userId);

    if (!user) {
      return;
    }

    /* state was already published by message handler */
    if (call.status === CallStatus.Initiated && call.direction === CallDirection.Outbound) {
      return;
    }

    if (call.isActive()) {
      user.call = call;

      user.broadcast(new CallMessage(call));
    } else {
      user.call = undefined;
      user.broadcast(new CallMessage(undefined));
    }

    return user;
  }

  async broadcastToAll(user: UserWithOnlineState) {
    this.getAll(user.account).forEach((it) => it.broadcast(new UserMessage(user.toResponse())));
  }

  async add(user: UserWithOnlineState): Promise<UserWithOnlineState> {
    this.pool.set(user.id, user);

    this.broadcastToAll(user);

    return user;
  }

  updateIfExists(user: UserWithOnlineState) {
    let it = this.getById(user.id);

    if (it) {
      this.pool.set(user.id, this.getUserWithOnlineState(user, it.sockets.get()));

      this.broadcastToAll(user);
    } else {
      throw new UserNotFoundException();
    }
  }

  delete(user: UserWithOnlineState) {
    user.sockets.close(1006);

    this.pool.delete(user.id);

    this.broadcastToAll(user);
  }

  getById(id: string): UserWithOnlineState | undefined {
    return this.pool.get(id);
  }

  getByIdOrFail(id: string) {
    const user = this.getById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async getByIdWithFallback(account: Account, id: string): Promise<UserWithOnlineState | undefined> {
    let userWithOnlineState = this.getById(id);

    if (userWithOnlineState) {
      return userWithOnlineState;
    } else {
      const user = await this.users.getById(account, id);

      if (user) {
        return this.getUserWithOnlineState(user);
      }
    }
  }

  async getOneByAccount(account: Account): Promise<UserWithOnlineState | undefined> {
    const users = this.getAll(account);

    if (users.length !== 0) {
      return Promise.resolve(users[0]);
    }
  }

  async getOneByAccountWithFallback(account: Account): Promise<UserWithOnlineState | undefined> {
    const user = this.getOneByAccount(account);

    if (user) {
      return Promise.resolve(user);
    } else {
      const user = await this.users.getOneByAccount(account);

      if (!user) {
        throw new UserNotFoundException();
      }

      return this.getUserWithOnlineState(user);
    }
  }

  getAll(account: Account): Array<UserWithOnlineState> {
    return Array.from(this.pool.values()).filter((user) => user.account.id === account.id);
  }

  getUserWithOnlineState = (user: User, sockets: Array<WebSocketWithKeepAlive> = []): UserWithOnlineState => {
    return new UserWithOnlineState(user, sockets, this.users);
  };

  getSize = () => {
    return this.pool.size;
  };
}
