import { BaseRepository } from './BaseRepository';
import { Call } from '../models/Call';
import { CallStatus } from '../models/CallStatus';
import { CallDirection } from '../models/CallDirection';
import { User } from '../models/User';
import { Account } from '../models/Account';

export interface CallData {
  callSid: string | undefined;
  from: string;
  to: string;
  status: CallStatus | undefined;
  direction: CallDirection;
  duration?: number | undefined;
}

export interface CallRepository extends BaseRepository<Call> {
  create: (data: CallData, account: Account, user?: User) => Promise<Call>;
  getByCallSid: (callSid: string) => Promise<Call | undefined>;
  getCallsByUser: (user: User) => Promise<Array<Call>>;
  getCallsByAccount: (account: Account) => Promise<Array<Call>>;
}
