import { UserWithOnlineState } from './UserWithOnlineState';
import { UserRepository } from '../repository/UserRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';

export class UserPool {
  users: Map<string, UserWithOnlineState>;
  repository: UserRepository;

  constructor(repository: UserRepository) {
    this.users = new Map();
    this.repository = repository;
  }

  async add(account: Account, id: string, socket?: WebSocketWithKeepAlive | undefined): Promise<UserWithOnlineState> {
    const user = await this.getByIdWithFallback(account, id);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (socket) {
      user.sockets.add(socket);
    }

    this.users.set(user.id, user);

    return user;
  }

  update(user: User) {
    let existing = this.getById(user.id);

    if (existing) {
      this.users.set(user.id, this.getUserWithOnlineState(user, existing.sockets.get()));
    }
  }

  delete(id: string) {
    const user = this.getById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    this.users.delete(user.id);
  }

  getById(id: string): UserWithOnlineState | undefined {
    return this.users.get(id);
  }

  async getByIdWithFallback(account: Account, id: string): Promise<UserWithOnlineState | undefined> {
    let userWithOnlineState = this.getById(id);

    if (userWithOnlineState) {
      return userWithOnlineState;
    } else {
      const user = await this.repository.getById(account, id);

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
      const user = await this.repository.getOneByAccount(account);

      if (!user) {
        throw new UserNotFoundException();
      }

      return this.getUserWithOnlineState(user);
    }
  }

  getAll(account: Account): Array<UserWithOnlineState> {
    return Array.from(this.users.values()).filter((user) => user.account.id === account.id);
  }

  getUserWithOnlineState = (user: User, sockets: Array<WebSocketWithKeepAlive> = []): UserWithOnlineState => {
    return new UserWithOnlineState(user, sockets, this.repository);
  };
}
