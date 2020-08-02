import { Request } from 'express';
import { Account } from '../models/Account';
import { Call } from '../models/Call';

export interface StatusCallbackRequest extends Request {
  account: Account;
  call: Call;
}
