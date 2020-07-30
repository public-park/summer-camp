import { Request, Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { accountRepository, userRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';

export const verifyAccountResourcePolicy = async (
  request: RequestWithUser,
  response: Response,
  next: NextFunction,
  accountId: string
) => {
  try {
    if (!isUUID(accountId)) {
      throw new InvalidUrlException('accountId is not a valid UUID');
    }

    const account = await accountRepository.getById(accountId);

    if (!account || account.id !== request.user.account.id) {
      throw new AccountNotFoundException();
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
