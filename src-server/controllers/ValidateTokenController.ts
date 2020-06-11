import { Request, Response } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { log } from '../logger';
import { userRepository } from '../worker';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';

const validate = async (req: Request, res: Response) => {
  log.info(`get user by name: ${req.body.name}`);

  res.header('Access-Control-Allow-Origin: *');

  try {
    const payload = TokenHelper.verifyJwt(req.body.token);

    const user = await userRepository.getById(payload.id);

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
