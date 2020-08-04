import { Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { userRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';

export const verifyUserResourcePolicy = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
  userId: string
) => {
  if (!isUUID(userId)) {
    return next(new InvalidUrlException('userId is not a valid UUID'));
  }

  try {
    const user = await userRepository.getById(req.user.account, userId);

    if (!user) {
      return next(new UserNotFoundException());
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
