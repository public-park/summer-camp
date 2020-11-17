import { Response, NextFunction } from 'express';
import { userRepository, accountRepository } from '../worker';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { ServerException } from '../exceptions/ServerException';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

export const addJwt = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    const { accountId, userId } = request.headers;

    const account = await accountRepository.getById(<string>accountId);

    if (!account) {
      return next(new AccountNotFoundException());
    }

    const user = await userRepository.getById(<string>userId);

    if (!user) {
      return next(new UserNotFoundException());
    }

    request.jwt = {
      user,
      account,
    };

    return next();
  } catch (error) {
    return next(new ServerException());
  }
};
