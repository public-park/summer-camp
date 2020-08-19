import { BaseRepository } from '../BaseRepository';
import AccountModel from './AccountSchema';
import { Account } from '../../models/Account';
import { AccountRepository } from '../AccountRepository';
import UserModel from './UserSchema';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { InvalidAccountNameException } from '../../exceptions/InvalidAccountNameException';

export class MongoAccountRepository implements AccountRepository, BaseRepository<Account> {
  async create(name: string) {
    if (!name) {
      throw new InvalidAccountNameException();
    }

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

  async getByUserName(name: string) {
    const document = await UserModel.findOne({ name: name });

    if (!document) {
      throw new AccountNotFoundException();
    }

    return this.getById(document.accountId);
  }

  async getById(id: string) {
    const document = await AccountModel.findById(id);

    if (document) {
      return document.toAccount();
    }
  }

  async update(account: Account) {
    const document = await AccountModel.findOneAndUpdate(
      { _id: account.id },
      {
        ...account,
      },
      {
        new: true,
      }
    );

    if (document) {
      return document.toAccount();
    } else {
      throw new AccountNotFoundException();
    }
  }

  async delete(account: Account) {
    const document = await AccountModel.deleteOne({ _id: account.id });

    if (document) {
      return;
    } else {
      throw new AccountNotFoundException();
    }
  }
}
