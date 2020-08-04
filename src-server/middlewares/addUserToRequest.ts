import { Response, NextFunction } from 'express';
import { userRepository, accountRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { ServerException } from '../exceptions/ServerException';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';

export const addUserToRequest = async (request: RequestWithUser, response: Response, next: NextFunction) => {
  try {
    const { accountId, userId } = request.headers;

    const account = await accountRepository.getById(<string>accountId);

    if (!account) {
      return next(new AccountNotFoundException());
    }

    const user = await userRepository.getById(account, <string>userId);

    if (!user) {
      return next(new UserNotFoundException());
    }

    request.user = user;

    return next();
  } catch (error) {
    return next(new ServerException());
  }
};
