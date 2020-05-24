import { Request, Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { InvalidUrlException } from '../../exceptions/InvalidUrlException';

export const verifyUserId = async (request: Request, response: Response, next: NextFunction, userId: string) => {
  if (!isUUID(userId)) {
    return next(new InvalidUrlException('userId is not a valid UUID'));
  }

  request.headers.userId = userId;

  return next();
};
