import { v4 as uuidv4 } from 'uuid';

import { BaseRepository } from '../BaseRepository';
import { getModel, AccountDocument } from './AccountSchema';
import { Account } from '../../models/Account';
import { AccountRepository } from '../AccountRepository';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { InvalidAccountNameException } from '../../exceptions/InvalidAccountNameException';
import { Model } from 'mongoose';

export class MongoAccountRepository implements AccountRepository, BaseRepository<Account> {
  private model: Model<AccountDocument>;

  constructor(COLLECTION_NAME: string) {
    this.model = getModel(COLLECTION_NAME);
  }

  async create(name: string) {
    if (!name) {
      throw new InvalidAccountNameException();
    }

    const account = new Account(uuidv4(), name);

    return await this.save(account);
  }

  async getByName(name: string) {
    const documents = await this.model.find({ name: name });

    return documents.map((document) => document.toAccount());
  }

  async getAll() {
    const documents = await this.model.find({});

    return documents.map((document) => document.toAccount());
  }

  async getById(id: string) {
    const document = await this.model.findById(id);

    if (document) {
      return document.toAccount();
    }
  }

  async save(account: Account) {
    const document = await this.model.findOneAndUpdate(
      { _id: account.id },
      {
        ...account,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (document) {
      return document.toAccount();
    } else {
      throw new AccountNotFoundException();
    }
  }

  async remove(account: Account) {
    const document = await this.model.deleteOne({ _id: account.id });

    if (document) {
      return;
    } else {
      throw new AccountNotFoundException();
    }
  }

  getModel() {
    return this.model;
  }
}
