import { Response, NextFunction } from 'express';
import { accountRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { createVoiceToken } from '../helpers/twilio/TwilioHelper';
import { AccountNotFoundError } from '../repository/AccountNotFoundError';

export const createToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(req.user.accountId); // TODO rename to accounts

    if (!account) {
      throw new AccountNotFoundError();
    }

    const payload = {
      token: createVoiceToken(account, req.user, 3600),
    };

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const PhoneController = {
  createToken,
};
