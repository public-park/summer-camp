import { v4 as uuidv4 } from 'uuid';
import { Account } from '../../models/Account';
import { AccountRepository } from '../AccountRepository';
import { BaseRepository } from '../BaseRepository';
import { FileBaseRepository } from './FileBaseRepository';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { InvalidAccountNameException } from '../../exceptions/InvalidAccountNameException';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { AccountConfiguration } from '../../models/AccountConfiguration';

interface AccountDocument {
  id: string;
  name: string;
  configuration: AccountConfiguration | undefined;
  createdAt: string;
}

const isValidAccountDocument = (data: unknown) => {
  if (typeof data !== 'object') {
    return false;
  }

  if (!data || !data.hasOwnProperty('id') || !data.hasOwnProperty('name') || !data.hasOwnProperty('createdAt')) {
    return false;
  }

  return true;
};

export class FileAccountRepository
  extends FileBaseRepository<Account>
  implements AccountRepository, BaseRepository<Account> {
  accounts: Map<string, Account>;

  constructor(fileName: string) {
    super(fileName);

    this.accounts = this.fromPlainObjects(this.load());
  }

  async create(name: string) {
    const account = new Account(uuidv4(), name);

    return await this.save(account);
  }

  getById = async (id: string) => {
    const account = this.accounts.get(id);

    return Promise.resolve(account);
  };

  getAll = async () => {
    return Promise.resolve(Array.from(this.accounts.values()));
  };

  save = async (account: Account) => {
    if (!account.name) {
      throw new InvalidAccountNameException();
    }

    this.accounts.set(account.id, account);

    await this.persist(this.toPlainObjects());

    return account;
  };

  remove = async (account: Account) => {
    if (!(await this.getById(account.id))) {
      throw new AccountNotFoundException();
    }

    this.accounts.delete(account.id);

    return this.persist(this.toPlainObjects());
  };

  protected toPlainObject(account: Account): AccountDocument {
    const item: AccountDocument = {
      id: account.id,
      name: account.name,
      createdAt: account.createdAt.toString(),
      configuration: undefined,
    };

    if (account.configuration) {
      item.configuration = {
        ...account.configuration,
        inbound: { ...account.configuration.inbound },
        outbound: { ...account.configuration.outbound },
      };
    }

    return item;
  }

  protected fromPlainObject(data: unknown): Account {
    if (!isValidAccountDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as AccountDocument;

    return new Account(item.id, item.name, item.configuration, new Date(item.createdAt));
  }

  protected toPlainObjects(): Array<AccountDocument> {
    return Array.from(this.accounts.values()).map((account) => {
      return this.toPlainObject(account);
    });
  }

  protected fromPlainObjects(list: Array<unknown>): Map<string, Account> {
    const accounts = new Map<string, Account>();

    list.map((data) => {
      const account = this.fromPlainObject(data);

      accounts.set(account.id, account);
    });

    return accounts;
  }

  getByName = async (name: string) => {
    return Array.from(this.accounts.values()).filter((account) => account.name === name);
  };
}
