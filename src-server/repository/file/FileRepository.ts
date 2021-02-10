import { ConnectionSettings } from '../../configuration/ConnectionSettings';
import { RepositoryInstance, RepositoryCreator } from '../Repository';
import { FileAccountRepository } from './FileAccountRepository';
import { FileCallRepository } from './FileCallRepository';
import { FileUserRepository } from './FileUserRepository';

export interface FileConnectionSettings extends ConnectionSettings {
  collections: {
    accounts: string;
    users: string;
    calls: string;
  };
}

export const FileRepository: RepositoryCreator = {
  create(settings: FileConnectionSettings) {
    const repository: RepositoryInstance = {
      accounts: new FileAccountRepository(settings.collections.accounts),
      users: new FileUserRepository(settings.collections.users),
      calls: new FileCallRepository(settings.collections.calls),
    };

    return repository;
  },
};
