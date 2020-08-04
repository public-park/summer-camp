import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../requests/RequestWithUser';
import { createVoiceToken } from '../helpers/twilio/TwilioHelper';

export const createToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const payload = {
      token: createVoiceToken(req.user, 3600),
    };

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const PhoneController = {
  createToken,
};
