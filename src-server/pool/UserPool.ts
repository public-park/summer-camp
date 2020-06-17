import { UserWithOnlineState } from './UserWithOnlineState';
import { UserRepository } from '../repository/UserRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';

const getUserWithOnlineState = (user: User): UserWithOnlineState => {
  return new UserWithOnlineState(user, false);
};

export class UserPool {
  users: Map<string, UserWithOnlineState>;
  repository: UserRepository;

  constructor(repository: UserRepository) {
    this.users = new Map();
    this.repository = repository;
  }

  async getUserById(id: string): Promise<UserWithOnlineState | undefined> {
    if (this.users.has(id)) {
      return Promise.resolve(this.users.get(id));
    } else {
      const user = await this.repository.getById(id);

      if (!user) {
        throw new UserNotFoundException();
      }

      return getUserWithOnlineState(user);
    }
  }

  async getOneByAccount(account: Account): Promise<UserWithOnlineState | undefined> {
    const users = this.getOnlineUsersByAccount(account);

    if (users.length !== 0) {
      return Promise.resolve(users[0]);
    } else {
      const user = await this.repository.getOneByAccountId(account.id);

      if (!user) {
        throw new UserNotFoundException();
      }

      return getUserWithOnlineState(user);
    }
  }

  getOnlineUsersByAccount(account: Account): Array<UserWithOnlineState> {
    const list = new Array<UserWithOnlineState>();

    for (let user of this.users.values()) {
      if (user.accountId === account.id) {
        list.push(user);
      }
    }

    return list;
  }
}
