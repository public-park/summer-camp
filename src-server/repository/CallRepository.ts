import { BaseRepository } from './BaseRepository';
import { Call } from '../models/Call';
import { CallStatus } from '../models/CallStatus';
import { CallDirection } from '../models/CallDirection';
import { User } from '../models/User';
import { Account } from '../models/Account';

export interface CallData {
  callSid: string;
  from: string;
  to: string;
  accountId: string;
  userId: string;
  status: CallStatus;
  direction: CallDirection;
  duration?: number | undefined;
}

export interface CallRepository extends BaseRepository<Call> {
  create: (data: CallData) => Promise<Call>;
  getByCallSid: (callSid: string) => Promise<Call | undefined>;
  getCallsByUser: (user: User) => Promise<Array<Call>>;
  getCallsByAccount: (account: Account) => Promise<Array<Call>>;
}
