import { Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { InvalidUrlException } from '../../exceptions/InvalidUrlException';
import { accountRepository } from '../../worker';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { ServerException } from '../../exceptions/ServerException';

export const addAccountToRequest = async (request: RequestWithAccount, response: Response, next: NextFunction, accountId: string) => {
  try {
    if (!isUUID(accountId)) {
      return next(new InvalidUrlException('accountId is not a valid UUID'));
    }

    const account = await accountRepository.getById(accountId);

    if (!account) {
      return next(new AccountNotFoundException());
    }

    request.account = account;
    return next();
  } catch (error) {
    return next(new ServerException());
  }
};
