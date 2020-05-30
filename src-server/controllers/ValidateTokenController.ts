import { Request, Response } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { log } from '../logger';

const validate = async (req: Request, res: Response) => {
  log.info(`get user by name: ${req.body.name}`);

  res.header('Access-Control-Allow-Origin: *');

  try {
    TokenHelper.verifyJwt(req.body.token);

    res.json({ isValid: true });
  } catch (error) {
    console.log(error);
    res.json({ isValid: false });
  }
};

export const ValidateTokenController = {
  validate,
};
