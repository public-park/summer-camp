import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../UserRepository';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import UserModel from './UserSchema';
import { UserActivity } from '../../models/UserActivity';
import { UserRole } from '../../models/UserRole';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { AccountRepository } from '../AccountRepository';
import { InvalidUserNameException } from '../../exceptions/InvalidUserNameException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';

export class MongoUserRepository implements UserRepository {
  accounts: AccountRepository;

  constructor(accounts: AccountRepository) {
    this.accounts = accounts;
  }

  async create(
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    account: Account,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown
  ) {
    if (!name) {
      throw new InvalidUserNameException();
    }

    const user = new User(uuidv4(), name, profileImageUrl, tags, activity, account.id, authentication, role);

    return this.save(user);
  }

  async getByName(name: string) {
    const query = {
      name: name,
    };

    const document = await UserModel.findOne(query);

    if (document) {
      return document.toUser();
    }
  }

  async getOneByAccount(account: Account) {
    const document = await UserModel.findOne({ accountId: account.id });

    if (document) {
      return document.toUser();
    }
  }

  async getById(id: string) {
    const document = await UserModel.findById(id);

    if (document) {
      return document.toUser();
    }
  }

  async getByNameId(account: Account, nameId: string) {
    const document = await UserModel.findOne({
      accountId: account.id,
      'authentication.nameId': nameId,
    });

    if (document) {
      return document.toUser();
    }
  }
  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const documents = await UserModel.find({ accountId: account.id }).skip(skip).limit(limit);

    return documents.map((document) => document.toUser());
  }

  async save(user: User) {
    if (!user.name) {
      throw new InvalidUserNameException();
    }

    const existing = await this.getById(user.id);

    if (existing && existing.accountId !== user.accountId) {
      throw new InvalidAccountException();
    }

    const document = await UserModel.findOneAndUpdate(
      { _id: user.id },
      {
        ...user,
        tags: Array.from(user.tags.values()),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (document) {
      return document.toUser();
    } else {
      throw new UserNotFoundException();
    }
  }

  async remove(user: User) {
    const document = await UserModel.deleteOne({ _id: user.id });

    if (document) {
      return;
    } else {
      throw new UserNotFoundException();
    }
  }
}
