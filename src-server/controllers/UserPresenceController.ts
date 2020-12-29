import { NextFunction, Response } from 'express';
import { pool } from '../worker';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

const get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await pool.getByIdWithFallback(req.params.userId!);

    if (!user) {
      throw new UserNotFoundException();
    }

    res.json(user.toPresenceDocument());
  } catch (error) {
    return next(error);
  }
};

export const UserPresenceController = {
  get,
};
