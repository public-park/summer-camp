import { BaseRepository } from './BaseRepository';
import { User, UserAuthentication } from '../models/User';
import { UserRole } from '../models/UserRole';
import { UserActivity } from '../models/UserActivity';

export interface UserRepository extends BaseRepository<User> {
  create: (
    name: string,
    profileImageUrl: string | undefined,
    tags: Set<string>,
    accountId: string,
    authentication: UserAuthentication,
    role: UserRole,
    activity: UserActivity
  ) => Promise<User>;
  getByName: (name: string) => Promise<User | undefined>;
  getOneByAccountId: (id: string) => Promise<User | undefined>;
}
