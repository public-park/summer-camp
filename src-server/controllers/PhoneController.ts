import { Response, NextFunction } from 'express';
import { createVoiceToken } from '../helpers/twilio/TwilioHelper';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

export const createToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const payload = {
      token: createVoiceToken(req.jwt.account, req.jwt.user, 3600),
    };

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const PhoneController = {
  createToken,
};
