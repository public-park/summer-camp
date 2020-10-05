import { Request, Response } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { authenticationProvider, userRepository, accountRepository } from '../worker';
import { isValidName } from './UserControllerValidator';
import { UserRole } from '../models/UserRole';
import { log } from '../logger';
import { isValidPassword } from './RegisterControllerValidator';

const register = async (req: Request, res: Response, next: any) => {
  log.debug(`get user by name: ${req.body.name}`);

  try {
    const name = req.body.name.trim();
    const password = req.body.password;

    await isValidName(name);
    await isValidPassword(password);

    const account = await accountRepository.create(`${name}'s Account`);
    const authentication = await authenticationProvider.create(password);

    const user = await userRepository.create(
      name,
      undefined,
      new Set(['none']),
      account,
      authentication,
      UserRole.Owner
    );

    const payload = {
      token: TokenHelper.createJwt(user, 14400),
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
