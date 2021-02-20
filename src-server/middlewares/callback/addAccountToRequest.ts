import { Response, NextFunction, request } from 'express';
import isUUID from 'validator/lib/isUUID';
import { InvalidUrlException } from '../../exceptions/InvalidUrlException';
import { accountRepository as accounts } from '../../worker';
import { AccountNotFoundException } from '../../exceptions/AccountNotFoundException';
import { ServerException } from '../../exceptions/ServerException';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { log } from '../../logger';

export const addAccountToRequest = async (
  request: StatusCallbackRequest,
  response: Response,
  next: NextFunction,
  accountId: string
) => {
  try {
    if (!isUUID(accountId)) {
      return next(new InvalidUrlException('accountId is not a valid UUID'));
    }

    const account = await accounts.getById(accountId);

    if (!account) {
      return next(new AccountNotFoundException());
    }

    request.resource = {
      ...request.resource,
      account,
    };

    return next();
  } catch (error) {
    log.error(error);
    return next(new ServerException());
  }
};
