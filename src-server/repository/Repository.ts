import { AccountRepository } from './AccountRepository';
import { CallRepository } from './CallRepository';
import { UserRepository } from './UserRepository';

export interface RepositoryInstance {
  accounts: AccountRepository;
  users: UserRepository;
  calls: CallRepository;
}

export interface RepositoryCreator {
  create: (...args: any) => RepositoryInstance;
}
