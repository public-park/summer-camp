import { Response, NextFunction } from 'express';
import { userRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { ServerException } from '../exceptions/ServerException';

export const addUserToRequest = async (request: RequestWithUser, response: Response, next: NextFunction) => {
  try {
    const user = await userRepository.getById(<string>request.headers.userId);

    if (!user) {
      return next(new UserNotFoundException());
    }

    request.user = user;

    return next();
  } catch (error) {
    return next(new ServerException());
  }
};
