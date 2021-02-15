import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { CallDirection } from '../models/CallDirection';
import { Call } from '../models/Call';
import { CallStatus } from '../models/CallStatus';

export interface CallRepository extends BaseRepository<Call> {
  create: (
    accountId: string,
    from: string,
    to: string,
    direction: CallDirection,
    status: CallStatus,
    user?: User
  ) => Promise<Call>;
  save: (call: Call) => Promise<Call>;
  getByCallSid: (callSid: string) => Promise<Call | undefined>;
  getByUser: (user: User, skip: number, limit: number) => Promise<Array<Call>>;
  getByAccount: (account: Account, skip: number, limit: number) => Promise<Array<Call>>;
  onLifecycleEvent: (listener: (call: Call) => void) => void;
}
