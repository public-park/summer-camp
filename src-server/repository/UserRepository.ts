import { User } from '../models/User';
import { UserRole } from '../models/UserRole';
import { UserActivity } from '../models/UserActivity';
import { Account } from '../models/Account';
import { UserAuthentication } from '../models/UserAuthenticationProvider';

export interface UserRepository {
  create: (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    account: Account,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity
  ) => Promise<User>;
  getById: (account: Account, id: string) => Promise<User | undefined>;
  getByName: (name: string, account?: Account) => Promise<User | undefined>;
  getByNameId: (account: Account, nameId: string) => Promise<User | undefined>;
  getOneByAccount: (account: Account) => Promise<User | undefined>;
  getAll: (account: Account, skip: number, limit: number) => Promise<Array<User>>;
  update: (account: Account, user: User) => Promise<User>;
  delete: (account: Account, user: User) => Promise<void>;
}
