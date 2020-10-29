import { Response, NextFunction } from 'express';
import { accountRepository as accounts } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';

const fetch = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = await accounts.getById(<string>req.params.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    res.json(account.toDocument());
  } catch (error) {
    return next(error);
  }
};

export const AccountController = {
  fetch,
};
