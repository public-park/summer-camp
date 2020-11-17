import { BaseRepository } from './BaseRepository';
import { Account } from '../models/Account';

export interface AccountRepository extends BaseRepository<Account> {
  create: (name: string) => Promise<Account>;
  getAll: () => Promise<Array<Account>>;
  getByName: (name: string) => Promise<Array<Account>>;
}
