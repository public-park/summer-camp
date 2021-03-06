import { Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { pool } from '../worker';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';

export const verifyUserResourcePolicy = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  userId: string
) => {
  if (!isUUID(userId)) {
    return next(new InvalidUrlException('userId is not a valid UUID'));
  }

  try {
    const user = await pool.getByIdWithFallback(userId);

    if (!user) {
      return next(new UserNotFoundException());
    }

    if (user.accountId !== req.jwt.user.accountId) {
      throw new UserNotFoundException();
    }

    req.resource = {
      ...req.resource,
      user,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
