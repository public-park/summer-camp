import { Request } from 'express';
import { Account } from '../models/Account';

export interface RequestWithAccount extends Request {
  account: Account;
}
