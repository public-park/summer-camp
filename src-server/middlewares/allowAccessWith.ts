import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../requests/RequestWithUser';
import { UserNotAuthorizedException } from '../exceptions/UserNotAuthorizedException';
import { Permission } from '../models/roles/Permission';

export default function allowAccessWith(name: Permission) {
  return (request: RequestWithUser, response: Response, next: NextFunction) => {
    if (request.user && request.user.hasPermission(name)) {
      return next();
    } else {
      return next(new UserNotAuthorizedException());
    }
  };
}
