import { Request, Response } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { userRepository, authenticationProvider } from '../worker';
import { UserNotFoundError } from '../repository/UserNotFoundError';
import { log } from '../logger';

const login = async (req: Request, res: Response, next: any) => {
  log.info(`get user by name: ${req.body.name}`);

  res.header('Access-Control-Allow-Origin: *');

  try {
    const user = await userRepository.getByName(req.body.name);

    if (!user) {
      throw new UserNotFoundError();
    }

    const isValidPassword = await authenticationProvider.authenticate(user, req.body.password);

    if (isValidPassword) {
      const payload = {
        token: TokenHelper.createJwt(user, 14400),
        userId: user.id,
      };

      res.json(payload);
    } else {
      res.status(401).end();
    }
  } catch (error) {
    next(error);
  }
};

export const LoginController = {
  login,
};
