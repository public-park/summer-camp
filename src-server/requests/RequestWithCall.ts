import { Request } from 'express';
import { Call } from '../models/Call';
import { User } from '../models/User';

export interface RequestWithCall extends Request {
  call: Call;
  user: User;
}
