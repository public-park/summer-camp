import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../requests/RequestWithUser';
import { pool } from '../worker';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';

const get = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const user = await pool.getByIdWithFallback(req.user.account, req.params.userId);

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
