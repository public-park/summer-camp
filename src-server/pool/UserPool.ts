import { UserWithOnlineState } from './UserWithOnlineState';
import { UserRepository } from '../repository/UserRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';
import { CallRepository } from '../repository/CallRepository';

export class UserPool {
  pool: Map<string, UserWithOnlineState>;
  calls: CallRepository;
  users: UserRepository;

  constructor(users: UserRepository, calls: CallRepository) {
    this.pool = new Map();
    this.users = users;
    this.calls = calls;

    this.calls.onUpdate((call) => {
      if (!call.userId) {
        return;
      }

      const user = this.getById(call.userId);

      if (!user) {
        return;
      }

      if (call.isActive()) {
        user.call = call;

        user.broadcast({ call: user.toResponse().call });
      } else {
        user.call = undefined;
        user.broadcast({ call: null });
      }
    });
  }

  async add(account: Account, id: string, socket?: WebSocketWithKeepAlive | undefined): Promise<UserWithOnlineState> {
    const user = await this.getByIdWithFallback(account, id);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (socket) {
      user.sockets.add(socket);
    }

    this.pool.set(user.id, user);

    return user;
  }

  update(user: User) {
    let existing = this.getById(user.id);

    if (existing) {
      this.pool.set(user.id, this.getUserWithOnlineState(user, existing.sockets.get()));
    }
  }

  delete(id: string) {
    const user = this.getById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    this.pool.delete(user.id);
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
