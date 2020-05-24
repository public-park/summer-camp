import { Request, Response } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { authenticationProvider, userRepository, accountRepository } from '../worker';
import { isValidName } from './UserControllerValidator';
import { log } from '../logger';

const register = async (req: Request, res: Response, next: any) => {
  log.debug(`get user by name: ${req.body.name}`);

  try {
    const name = req.body.name.trim();

    await isValidName(name);

    const account = await accountRepository.create(`${name}'s Account`);
    const authentication = await authenticationProvider.create(req.body.password);

    const user = await userRepository.create(
      name,
      undefined,
      new Set(['none']),
      account.id,
      new Set(['account.configuration.update', 'account.configuration.read', 'self.token.create', 'user.read']),
      authentication
    );

    const payload = {
      token: TokenHelper.createJwt(user, 180),
      user: {
        id: user.id,
        name: user.name,
      },
    };

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const RegisterController = {
  register,
};
