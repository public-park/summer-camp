import * as mongoose from 'mongoose';
import { ConnectionSettings } from '../../configuration/ConnectionSettings';
import { log } from '../../logger';

import { RepositoryCreator, RepositoryInstance } from '../Repository';
import { MongoAccountRepository } from './MongoAccountRepository';
import { MongoCallRepository } from './MongoCallRepository';
import { MongoUserRepository } from './MongoUserRepository';

export interface MongoConnectionSettings extends ConnectionSettings {
  uri: string;
  options: mongoose.ConnectionOptions;
  collections: {
    accounts: string;
    users: string;
    calls: string;
  };
}

export const MongoRepository: RepositoryCreator = {
  create(settings: MongoConnectionSettings) {
    mongoose
      .connect(settings.uri, settings.options)
      .then(() => {
        log.info(`connected to ${settings.uri} ...`);
      })
      .catch((error) => log.error(error));

    const repository: RepositoryInstance = {
      accounts: new MongoAccountRepository(settings.collections.accounts),
      users: new MongoUserRepository(settings.collections.users),
      calls: new MongoCallRepository(settings.collections.calls),
    };

    return repository;
  },
};
