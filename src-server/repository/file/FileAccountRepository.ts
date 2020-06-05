import { v4 as uuidv4 } from 'uuid';
import { Account } from '../../models/Account';
import { AccountRepository } from '../AccountRepository';
import { BaseRepository } from '../BaseRepository';
import { FileBaseRepository } from './FileBaseRepository';
import { AccountNameError } from '../AccountNameError';
import { AccountNotFoundError } from '../AccountNotFoundError';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';

export class FileAccountRepository extends FileBaseRepository<Account>
  implements AccountRepository, BaseRepository<Account> {
  accounts: Map<string, Account>;

  constructor(fileName: string) {
    super(fileName);
    // TODO fixme, where to catch
    this.accounts = this.fromPlainObjects(this.load());
  }

  getById = async (id: string) => {
    const account = this.accounts.get(id);

    if (account) {
      return Promise.resolve(this.getCopy(account));
    }
  };

  getAll = async () => {
    const list: Account[] = [];

    for (const user of this.accounts.values()) {
      list.push(this.getCopy(user));
    }

    return Promise.resolve(list);
  };

  update = async (account: Account) => {
    if (!(await this.getById(account.id))) throw new AccountNotFoundError();

    const existingAccount = await this.getById(account.id);

    if (existingAccount && existingAccount.name !== account.name) {
      if (await this.getByName(account.name)) {
        throw new Error(); // TODO add error code
      }
    }

    this.accounts.set(account.id, account);

    await this.persist(this.toPlainObjects());

    return this.getCopy(account);
  };

  delete = async (account: Account) => {
    if (!(await this.getById(account.id))) {
      throw new AccountNotFoundError();
    }

    this.accounts.delete(account.id);

    return this.persist(this.toPlainObjects());
  };

  create = async (name: string) => {
    if (name === '') {
      throw new AccountNameError();
    }

    if (await this.getByName(name)) {
      throw new AccountNotFoundException();
    }

    const account = new Account(uuidv4(), name);

    this.accounts.set(account.id, account);

    await this.persist(this.toPlainObjects());

    return Promise.resolve(this.getCopy(account));
  };

  protected getCopy(account: Account) {
    return this.fromPlainObject(this.toPlainObject(account));
  }

  protected toPlainObject(account: Account): any {
    const item: any = {
      id: account.id,
      name: account.name,
      createdAt: account.createdAt,
    };

    if (account.configuration) {
      item.configuration = {
        ...account.configuration,
      };
      item.configuration = {
        ...account.configuration,
        inbound: { ...account.configuration.inbound },
        outbound: { ...account.configuration.outbound },
      };
    }

    return item;
  }

  protected fromPlainObject(item: any): Account {
    return new Account(item.id, item.name, item.configuration, item.createdAt);
  }

  protected toPlainObjects(): Array<Account> {
    return Array.from(this.accounts.values()).map((account) => {
      return this.toPlainObject(account);
    });
  }

  protected fromPlainObjects(list: Array<any>): Map<string, Account> {
    const accounts = new Map<string, Account>();

    list.map((item) => {
      accounts.set(item.id, new Account(item.id, item.name, item.configuration, item.createdAt));
    });

    return accounts;
  }

  getByName = async (name: string) => {
    for (const account of this.accounts.values()) {
      if (account.name === name) {
        return Promise.resolve(this.getCopy(account));
      }
    }
  };
}
