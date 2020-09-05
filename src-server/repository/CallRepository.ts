import { BaseRepository } from './BaseRepository';
import { Call } from '../models/Call';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { CallDirection } from '../models/CallDirection';
import { CallStatus } from '../models/CallStatus';

export interface CallRepository extends BaseRepository<Call> {
  create: (
    from: string,
    to: string,
    account: Account,
    status: CallStatus,
    direction: CallDirection,
    user?: User,
    callSid?: string
  ) => Promise<Call>;
  getByCallSid: (callSid: string) => Promise<Call | undefined>;
  getByUser: (user: User, skip: number, limit: number) => Promise<Array<Call>>;
  getByAccount: (account: Account, skip: number, limit: number) => Promise<Array<Call>>;
  onUpdate: (listener: (call: Call) => void) => void;
}
