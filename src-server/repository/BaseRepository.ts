import { Account } from '../models/Account';

export interface BaseRepository<T> {
  getById: (id: string) => Promise<T | undefined>;
  create: (...args: any) => Promise<T>;
  update: (entity: T) => Promise<T>;
  delete: (entity: T) => Promise<void>;
}
