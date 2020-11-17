import { Response, NextFunction } from 'express';
import { UserNotAuthorizedException } from '../exceptions/UserNotAuthorizedException';
import { Permission } from '../models/roles/Permission';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

export default function allowAccessWith(name: Permission) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (request.jwt.user && request.jwt.user.hasPermission(name)) {
      return next();
    } else {
      return next(new UserNotAuthorizedException());
    }
  };
}
