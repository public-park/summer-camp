import { v4 as uuidv4 } from 'uuid';
import { Account } from '../../models/Account';
import { AccountRepository } from '../AccountRepository';
import { BaseRepository } from '../BaseRepository';
import { FileBaseRepository } from './FileBaseRepository';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { InvalidAccountNameException } from '../../exceptions/InvalidAccountNameException';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { AccountConfiguration } from '../../models/AccountConfiguration';
import { AccountDocument } from '../../models/documents/AccountDocument';

interface AccountJsonDocument {
  id: string;
  name: string;
  configuration:
    | {
        key?: string;
        secret?: string;
        accountSid?: string;
        inbound: {
          isEnabled: boolean;
          phoneNumber?: string;
        };
        outbound: {
          isEnabled: boolean;
          mode?: string;
          phoneNumber?: string;
        };
      }
    | undefined;
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

    this.accounts = this.fromFile(this.load());
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

    await this.persist(this.toFile());

    return account;
  };

  remove = async (account: Account) => {
    if (!(await this.getById(account.id))) {
      throw new AccountNotFoundException();
    }

    this.accounts.delete(account.id);

    return this.persist(this.toFile());
  };

  protected toAccountDocument(account: Account): AccountDocument {
    return account.toDocument();
  }

  protected convertDocumentToAccount(data: unknown): Account {
    if (!isValidAccountDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as AccountJsonDocument;

    const configuration: AccountConfiguration = {
      key: undefined,
      secret: undefined,
      accountSid: undefined,
      inbound: {
        isEnabled: false,
        phoneNumber: undefined,
      },
      outbound: {
        isEnabled: false,
        mode: undefined,
        phoneNumber: undefined,
      },
    };

    Object.assign(configuration, item.configuration);

    return new Account(item.id, item.name, configuration, new Date(item.createdAt));
  }

  protected toFile(): Array<AccountDocument> {
    return Array.from(this.accounts.values()).map((account) => {
      return this.toAccountDocument(account);
    });
  }

  protected fromFile(list: Array<unknown>): Map<string, Account> {
    const accounts = new Map<string, Account>();

    list.map((data) => {
      const account = this.convertDocumentToAccount(data);

      accounts.set(account.id, account);
    });

    return accounts;
  }

  getByName = async (name: string) => {
    return Array.from(this.accounts.values()).filter((account) => account.name === name);
  };
}
