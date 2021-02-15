import { NextFunction, Response } from 'express';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

const get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.resource.user) {
      throw new UserNotFoundException();
    }

    let user = req.resource.user;

    res.json(user.toPresenceDocument());
  } catch (error) {
    return next(error);
  }
};

export const UserPresenceController = {
  get,
};
