import { Request } from 'express';
import { Account } from '../models/Account';
import { Call } from '../models/Call';

export interface StatusCallbackRequest extends Request {
  resource: {
    call: Call;
    account: Account;
  };
}
