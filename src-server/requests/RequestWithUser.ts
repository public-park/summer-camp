import { Request } from 'express';
import { User } from '../models/User';

export interface RequestWithUser extends Request {
  user: User;
}
