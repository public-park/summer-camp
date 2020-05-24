import { BaseRepository } from './BaseRepository';
import { Account } from '../models/Account';

export interface AccountRepository extends BaseRepository<Account> {
  create: (name: string) => Promise<Account>;
  getByName: (name: string) => Promise<Account | undefined>;
}
