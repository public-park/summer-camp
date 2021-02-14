import { User } from '../models/User';
import { UserRole } from '../models/UserRole';
import { UserActivity } from '../models/UserActivity';
import { Account } from '../models/Account';
import { UserAuthentication } from '../models/UserAuthenticationProvider';
import { UserConfiguration } from '../models/UserConfiguration';

export interface UserRepository {
  create: (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity,
    configuration?: UserConfiguration
  ) => Promise<User>;
  save: (user: User) => Promise<User>;
  getById: (id: string) => Promise<User | undefined>;
  getByName: (name: string) => Promise<User | undefined>;
  getByNameId: (account: Account, nameId: string) => Promise<User | undefined>;
  getOneByAccount: (account: Account) => Promise<User | undefined>;
  getAll: (account: Account, skip?: number, limit?: number) => Promise<Array<User>>;
  remove: (user: User) => Promise<void>;
}
