import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../UserRepository';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { UserDocument, getModel } from './UserSchema';
import { UserActivity } from '../../models/UserActivity';
import { UserRole } from '../../models/UserRole';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { InvalidUserNameException } from '../../exceptions/InvalidUserNameException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';
import { Model } from 'mongoose';
import { UserConfiguration } from '../../models/UserConfiguration';

export class MongoUserRepository implements UserRepository {
  private model: Model<UserDocument>;

  constructor(COLLECTION_NAME: string) {
    this.model = getModel(COLLECTION_NAME);
  }

  async create(
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown,
    configuration?: UserConfiguration
  ) {
    if (!name) {
      throw new InvalidUserNameException();
    }

    const user = new User(
      uuidv4(),
      name,
      profileImageUrl,
      tags,
      activity,
      accountId,
      authentication,
      role,
      configuration
    );

    return this.save(user);
  }

  async getByName(name: string) {
    const query = {
      name: name,
    };

    const document = await this.model.findOne(query);

    if (document) {
      return document.toUser();
    }
  }

  async getOneByAccount(account: Account) {
    const document = await this.model.findOne({ accountId: account.id });

    if (document) {
      return document.toUser();
    }
  }

  async getById(id: string) {
    const document = await this.model.findById(id);

    if (document) {
      return document.toUser();
    }
  }

  async getByNameId(account: Account, nameId: string) {
    const document = await this.model.findOne({
      accountId: account.id,
      'authentication.nameId': nameId,
    });

    if (document) {
      return document.toUser();
    }
  }
  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const documents = await this.model.find({ accountId: account.id }).skip(skip).limit(limit);

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

    const document = await this.model.findOneAndUpdate(
      { _id: user.id },
      {
        ...user.toDocument(),
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
    const document = await this.model.deleteOne({ _id: user.id });

    if (document) {
      return;
    } else {
      throw new UserNotFoundException();
    }
  }

  getModel() {
    return this.model;
  }
}
