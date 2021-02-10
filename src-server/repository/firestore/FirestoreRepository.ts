import { Firestore } from '@google-cloud/firestore';
import { FirestoreAccountRepository } from './FirestoreAccountRepository';
import { FirestoreCallRepository } from './FirestoreCallRepository';
import { FirestoreUserRepository } from './FirestoreUserRepository';
import { RepositoryCreator, RepositoryInstance } from '../Repository';
import { ConnectionSettings } from '../../configuration/ConnectionSettings';

export interface FirestoreConnectionSettings extends ConnectionSettings {
  options: FirebaseFirestore.Settings;
  collections: {
    accounts: string;
    users: string;
    calls: string;
  };
}

export const FirestoreRepository: RepositoryCreator = {
  create(settings: FirestoreConnectionSettings) {
    const firestore = new Firestore(settings.options);

    const repository: RepositoryInstance = {
      accounts: new FirestoreAccountRepository(firestore, settings.collections.accounts),
      users: new FirestoreUserRepository(firestore, settings.collections.users),
      calls: new FirestoreCallRepository(firestore, settings.collections.calls),
    };

    return repository;
  },
};
