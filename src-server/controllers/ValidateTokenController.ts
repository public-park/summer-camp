import { Request, Response } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { log } from '../logger';
import { userRepository, accountRepository } from '../worker';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';

const validate = async (req: Request, res: Response) => {
  log.debug(`validate token ${req.body.token}`);

  try {
    const payload = TokenHelper.verifyJwt(req.body.token);

    const account = await accountRepository.getById(payload.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    const user = await userRepository.getById(account, payload.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    res.json({ isValid: true });
  } catch (error) {
    res.json({ isValid: false });
  }
};

export const ValidateTokenController = {
  validate,
};
