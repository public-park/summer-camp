import { Response, NextFunction } from 'express';
import { UserPermissions } from '../models/UserPermissions';
import { RequestWithUser } from '../requests/RequestWithUser';
import { UserNotAuthorizedException } from '../exceptions/UserNotAuthorizedException';

export default function allowAccessWith(name: UserPermissions) {
  return (request: RequestWithUser, response: Response, next: NextFunction) => {
    if (request.user && request.user.hasPermission(name)) {
      return next();
    } else {
      return next(new UserNotAuthorizedException());
    }
  };
}
