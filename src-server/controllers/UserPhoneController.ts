import { Response, NextFunction } from 'express';
import { accountRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { createVoiceToken } from '../helpers/twilio/TwilioHelper';
import { InvalidConfigurationException } from '../exceptions/InvalidConfigurationException';

export interface CreateTokenResponseInterface {
  token: string;
}

export const createToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(req.user.accountId);

    if (!account) {
      throw new InvalidConfigurationException();
    }

    const payload: CreateTokenResponseInterface = {
      token: createVoiceToken(account, req.user, 600),
    };

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const UserPhoneController = {
  createToken,
};
