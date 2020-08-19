import { UserRepository } from '../UserRepository';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import UserModel from './UserSchema';
import { UserActivity } from '../../models/UserActivity';
import AccountModel from './AccountSchema';
import { UserRole } from '../../models/UserRole';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { UserNotAuthorizedException } from '../../exceptions/UserNotAuthorizedException';
import { AccountRepository } from '../AccountRepository';
import { InvalidUserNameException } from '../../exceptions/InvalidUserNameException';
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';

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

    await AccountModel.findOne({ _id: account.id }).orFail();

    const model = new UserModel({
      name: name,
      profileImageUrl: profileImageUrl,
      tags: Array.from(tags.values()),
      accountId: account.id,
      activity: activity,
      authentication: authentication,
      role: role,
    });

    const document = await model.save();

    return document.toUser(account);
  }

  private async getByNameWithAccount(name: string, account: Account) {
    const query = {
      name: name,
      accountId: account.id,
    };

    const document = await UserModel.findOne(query);

    if (document) {
      return document.toUser(<Account>account);
    }
  }

  private async getByNameWithoutAccount(name: string) {
    const query = {
      name: name,
    };

    const document = await UserModel.findOne(query);

    if (document) {
      const account = await this.accounts.getById(document.accountId);

      return document.toUser(<Account>account);
    }
  }

  async getByName(name: string, account?: Account) {
    if (account) {
      return this.getByNameWithAccount(name, account);
    } else {
      return this.getByNameWithoutAccount(name);
    }
  }

  async getOneByAccount(account: Account) {
    const document = await UserModel.findOne({ accountId: account.id });

    if (document) {
      return document.toUser(account);
    }
  }

  async getById(account: Account, id: string) {
    const document = await UserModel.findById(id);

    if (document) {
      if (account.id !== document.accountId) {
        throw new UserNotAuthorizedException();
      }

      return document.toUser(account);
    }
  }

  async getByNameId(account: Account, nameId: string) {
    const document = await UserModel.findOne({
      accountId: account.id,
      'authentication.nameId': nameId,
    });

    if (document) {
      return document.toUser(account);
    }
  }
  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const documents = await UserModel.find({ accountId: account.id }).skip(skip).limit(limit);

    return documents.map((document) => document.toUser(account));
  }

  async update(account: Account, user: User) {
    if (!user.name) {
      throw new InvalidUserNameException();
    }

    if (user.account.id !== account.id) {
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
      }
    );

    if (document) {
      return document.toUser(account);
    } else {
      throw new UserNotFoundException();
    }
  }

  async delete(account: Account, user: User) {
    const document = await UserModel.deleteOne({ _id: user.id, accountId: account.id });

    if (document) {
      return;
    } else {
      throw new UserNotFoundException();
    }
  }
}
