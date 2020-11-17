import { Request, Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { accountRepository as accounts } from '../worker';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

export const verifyAccountResourcePolicy = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
  accountId: string
) => {
  try {
    if (!isUUID(accountId)) {
      throw new InvalidUrlException('accountId is not a valid UUID');
    }

    const account = await accounts.getById(accountId);

    if (!account || account.id !== request.jwt.account.id) {
      throw new AccountNotFoundException();
    }

    request.resource = {
      ...request.resource,
      account,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
