import { v4 as uuidv4 } from 'uuid';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { UserRepository } from '../UserRepository';
import { UserActivity } from '../../models/UserActivity';
import { UserRole } from '../../models/UserRole';
import { UserAlreadyExistsException } from '../../exceptions/UserAlreadyExistsException';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { UserAuthentication } from '../../models/UserAuthenticationProvider';
import { InvalidUserNameException } from '../../exceptions/InvalidUserNameException';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import { InvalidAccountException } from '../../exceptions/InvalidAccountException';
import { EventEmitter } from 'events';
import { UserConfiguration } from '../../models/UserConfiguration';

interface UserFirestoreDocument {
  id: string;
  name: string;
  profileImageUrl?: string;
  tags: string[];
  activity: UserActivity;
  accountId: string;
  authentication: UserAuthentication;
  role: UserRole;
  configuration?: UserConfiguration;
  createdAt: Timestamp;
}

const isValidUserDocument = (data: unknown) => {
  if (typeof data !== 'object') {
    return false;
  }

  if (
    !data ||
    !data.hasOwnProperty('id') ||
    !data.hasOwnProperty('name') ||
    !data.hasOwnProperty('tags') ||
    !data.hasOwnProperty('activity') ||
    !data.hasOwnProperty('accountId') ||
    !data.hasOwnProperty('authentication') ||
    !data.hasOwnProperty('role') ||
    !data.hasOwnProperty('createdAt')
  ) {
    return false;
  }

  return true;
};

export class FirestoreUserRepository implements UserRepository {
  private firestore: Firestore;
  private COLLECTION_NAME: string;
  private eventEmitter = new EventEmitter();

  constructor(firestore: Firestore, COLLECTION_NAME: string) {
    this.firestore = firestore;
    this.COLLECTION_NAME = COLLECTION_NAME;
    this.eventEmitter = new EventEmitter();
  }

  getById = async (id: string) => {
    const document = await this.firestore.doc(`${this.COLLECTION_NAME}/${id}`).get();

    if (document.exists) {
      return this.convertDocumentToUser(document.data());
    }
  };

  async getAll(account: Account, skip: number = 0, limit: number = 50) {
    const list = await this.firestore
      .collection(this.COLLECTION_NAME)
      .where('accountId', '==', account.id)
      .orderBy('createdAt', 'desc')
      .offset(skip)
      .limit(limit)
      .get();

    const users: Array<User> = [];

    list.docs.map(async (document) => {
      const user = this.convertDocumentToUser(document.data());

      users.push(user);
    });

    return users;
  }

  save = async (user: User) => {
    if (!user.name) {
      throw new InvalidUserNameException();
    }

    const existing = await this.getByName(user.name);

    if (existing && existing.id !== user.id) {
      throw new UserAlreadyExistsException();
    }

    if (existing && existing.accountId !== user.accountId) {
      throw new InvalidAccountException();
    }

    await this.firestore.doc(`${this.COLLECTION_NAME}/${user.id}`).set(this.convertUserToDocument(user));

    return user;
  };

  remove = async (user: User) => {
    if (!(await this.getById(user.id))) {
      throw new UserNotFoundException();
    }

    await this.firestore.collection(this.COLLECTION_NAME).doc(user.id).delete();
  };

  getByName = async (name: string) => {
    const list = await this.firestore.collection(this.COLLECTION_NAME).where('name', '==', name).limit(1).get();

    if (!list.empty && list.docs[0]) {
      const user = this.convertDocumentToUser(list.docs[0].data());

      return user;
    }
  };

  getOneByAccount = async (account: Account) => {
    const list = await this.firestore
      .collection(this.COLLECTION_NAME)
      .where('accountId', '==', account.id)
      .limit(1)
      .get();

    if (!list.empty && list.docs[0]) {
      return await this.convertDocumentToUser(list.docs[0].data());
    }
  };

  async getByNameId(account: Account, nameId: string) {
    const list = await this.firestore
      .collection(this.COLLECTION_NAME)
      .where('accountId', '==', account.id)
      .where('authentication.nameId', '==', nameId)
      .limit(1)
      .get();

    if (!list.empty && list.docs[0]) {
      return await this.convertDocumentToUser(list.docs[0].data());
    }
  }

  protected convertUserToDocument(user: User): UserFirestoreDocument {
    return {
      ...user.toDocument(),
      createdAt: Timestamp.fromDate(user.createdAt),
    };
  }

  protected convertDocumentToUser(data: unknown): User {
    if (!isValidUserDocument(data)) {
      throw new InvalidDocumentException();
    }

    const document = data as UserFirestoreDocument;

    return new User(
      document.id,
      document.name,
      document.profileImageUrl || undefined,
      new Set(document.tags),
      document.activity,
      document.accountId,
      document.authentication,
      document.role,
      document.configuration,
      document.createdAt.toDate()
    );
  }

  create = (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity = UserActivity.Unknown,
    configuration?: UserConfiguration
  ) => {
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
  };

  onSave(listener: (account: User) => void) {
    this.eventEmitter.on('user', listener);
  }
}
