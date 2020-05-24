import { BaseRepository } from '../BaseRepository';
import AccountModel from './AccountSchema';
import { AccountNotFoundError } from '../AccountNotFoundError';
import { Account } from '../../models/Account';
import { AccountRepository } from '../AccountRepository';
import { AccountNameError } from '../AccountNameError';

export class MongoAccountRepository implements AccountRepository, BaseRepository<Account> {
  async create(name: string) {
    if (name === '') throw new AccountNameError();

    const model = new AccountModel({
      name: name,
    });

    const document = await model.save();

    return document.toAccount();
  }

  async getByName(name: string) {
    const document = await AccountModel.findOne({ name: name });

    if (document) {
      return document.toAccount();
    }
  }

  async getById(id: string) {
    const document = await AccountModel.findById(id);

    if (document) {
      return document.toAccount();
    }
  }

  async getAll() {
    const documents = await AccountModel.find({});

    return documents.map((document) => document.toAccount());
  }

  async update(entity: Account) {
    const document = await AccountModel.findOneAndUpdate(
      { _id: entity.id },
      {
        ...entity,
      },
      {
        new: true,
      }
    );

    if (document) {
      return document.toAccount();
    } else {
      throw new AccountNotFoundError();
    }
  }

  async delete(entity: Account) {
    const document = await AccountModel.deleteOne({ _id: entity.id });

    if (document) {
      return;
    } else {
      throw new AccountNotFoundError();
    }
  }
}
