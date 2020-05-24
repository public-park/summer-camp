import { UserRepository } from '../UserRepository';
import { BaseRepository } from '../BaseRepository';
import { User, UserAuthentication } from '../../models/User';
import { UserPermissions } from '../../models/UserPermissions';
import UserModel from './UserSchema';
import { UserActivity } from '../../models/UserActivity';
import { UserNotFoundError } from '../UserNotFoundError';
import { UserNameError } from '../UserNameError';
import AccountModel from './AccountSchema';

export class MongoUserRepository implements UserRepository, BaseRepository<User> {
  async create(
    name: string,
    profileUrl: string | undefined,
    labels: Set<string>,
    accountId: string,
    permissions: Set<UserPermissions>,
    authentication: UserAuthentication
  ) {
    if (name === '') throw new UserNameError();

    await AccountModel.findOne({ _id: accountId }).orFail();

    const model = new UserModel({
      name: name,
      profileUrl: profileUrl,
      labels: Array.from(labels.values()),
      accountId: accountId,
      permissions: Array.from(permissions.values()),
      activity: UserActivity.Unknown,
      authentication: authentication,
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
        labels: Array.from(entity.labels.values()),
        permissions: Array.from(entity.permissions.values()),
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
