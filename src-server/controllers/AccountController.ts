import { Response, NextFunction } from 'express';
import { accountRepository as accounts } from '../worker';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

const fetch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const account = await accounts.getById(<string>req.params.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    const body = account.toDocument();

    delete body.configuration;

    res.json(body);
  } catch (error) {
    return next(error);
  }
};

export const AccountController = {
  fetch,
};
