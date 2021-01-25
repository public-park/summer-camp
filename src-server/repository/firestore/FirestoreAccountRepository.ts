import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../BaseRepository';
import { Account } from '../../models/Account';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import { AccountConfiguration } from '../../models/AccountConfiguration';
import { InvalidAccountNameException } from '../../exceptions/InvalidAccountNameException';
import { AccountRepository } from '../AccountRepository';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';

interface AccountFirestoreDocument {
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
  createdAt: Timestamp;
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

export class FirestoreAccountRepository implements AccountRepository, BaseRepository<Account> {
  private firestore: Firestore;
  private COLLECTION_NAME: string;

  constructor(firestore: Firestore, COLLECTION_NAME: string) {
    this.firestore = firestore;
    this.COLLECTION_NAME = COLLECTION_NAME;
  }

  async create(name: string) {
    const account = new Account(uuidv4(), name);

    return await this.save(account);
  }

  save = async (account: Account) => {
    if (!account.name) {
      throw new InvalidAccountNameException();
    }

    const document: FirebaseFirestore.WriteResult = await this.firestore
      .doc(`${this.COLLECTION_NAME}/${account.id}`)
      .set(this.convertAccountToDocument(account));

    return account;
  };

  protected convertDocumentToAccount(data: unknown): Account {
    if (!isValidAccountDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as AccountFirestoreDocument;

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

    return new Account(item.id, item.name, configuration, item.createdAt.toDate());
  }

  async getById(id: string) {
    const document = await this.firestore.doc(`${this.COLLECTION_NAME}/${id}`).get();

    if (document.exists) {
      return this.convertDocumentToAccount(document.data());
    }
  }

  protected convertAccountToDocument(account: Account): AccountFirestoreDocument {
    return {
      ...account,
      createdAt: Timestamp.fromDate(account.createdAt),
    };
  }

  async getByName(name: string) {
    const list = await this.firestore.collection(this.COLLECTION_NAME).where('name', '==', name).get();

    const accounts: Array<Account> = [];

    list.forEach((document) => {
      accounts.push(this.convertDocumentToAccount(document.data()));
    });

    return accounts;
  }

  async getAll() {
    const list = await this.firestore.collection(this.COLLECTION_NAME).get();

    const accounts: Array<Account> = [];

    list.forEach((document) => {
      accounts.push(this.convertDocumentToAccount(document.data()));
    });

    return accounts;
  }

  async remove(account: Account) {
    if (!(await this.getById(account.id))) {
      throw new AccountNotFoundException();
    }

    await this.firestore.collection(this.COLLECTION_NAME).doc(account.id).delete();
  }
}
