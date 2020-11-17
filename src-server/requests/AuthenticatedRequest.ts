import { Request } from 'express';
import { Account } from '../models/Account';
import { Call } from '../models/Call';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  jwt: {
    user: User;
    account: Account;
  };

  resource: {
    user: User | undefined;
    call: Call | undefined;
    account: Account | undefined;
  };
}
