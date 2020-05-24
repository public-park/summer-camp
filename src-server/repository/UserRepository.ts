import { BaseRepository } from './BaseRepository';
import { User, UserAuthentication } from '../models/User';
import { UserPermissions } from '../models/UserPermissions';

export interface UserRepository extends BaseRepository<User> {
  create: (
    name: string,
    profileUrl: string | undefined,
    labels: Set<string>,
    accountId: string,
    permissions: Set<UserPermissions>,
    authentication: UserAuthentication
  ) => Promise<User>;
  getByName: (name: string) => Promise<User | undefined>;
}
