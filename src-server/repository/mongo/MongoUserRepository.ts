import { UserRepository } from '../UserRepository';
import { BaseRepository } from '../BaseRepository';
import { User, UserAuthentication } from '../../models/User';
import { Permission } from '../../models/roles/Permission';
import UserModel from './UserSchema';
import { UserActivity } from '../../models/UserActivity';
import { UserNotFoundError } from '../UserNotFoundError';
import { UserNameError } from '../UserNameError';
import AccountModel from './AccountSchema';
import { UserRole } from '../../models/UserRole';

export class MongoUserRepository implements UserRepository, BaseRepository<User> {
  async create(
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown
  ) {
    if (name === '') {
      throw new UserNameError();
    }

    await AccountModel.findOne({ _id: accountId }).orFail();

    const model = new UserModel({
      name: name,
      profileImageUrl: profileImageUrl,
      tags: Array.from(tags.values()),
      accountId: accountId,
      activity: activity,
      authentication: authentication,
      role: role,
    });

    const document = await model.save();

    return document.toUser();
  }

  async getByName(name: string) {
    const document = await UserModel.findOne({ name: name });

    if (document) {
      return document.toUser();
    }
  }

  async getOneByAccountId(id: string) {
    const document = await UserModel.findOne({ accountId: id });

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

  async getAll() {
    const documents = await UserModel.find({});

    return documents.map((document) => document.toUser());
  }

  async update(entity: User) {
    if (entity.name === '') throw new UserNameError();
    await AccountModel.findOne({ _id: entity.accountId }).orFail();

    const document = await UserModel.findOneAndUpdate(
      { _id: entity.id },
      {
        ...entity,
        tags: Array.from(entity.tags.values()),
      },
      {
        new: true,
      }
    );

    if (document) {
      return document.toUser();
    } else {
      throw new UserNotFoundError();
    }
  }

  async delete(entity: User) {
    const document = await UserModel.deleteOne({ _id: entity.id });

    if (document) {
      return;
    } else {
      throw new UserNotFoundError();
    }
  }
}
