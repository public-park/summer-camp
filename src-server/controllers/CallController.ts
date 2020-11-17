import { Response, NextFunction } from 'express';
import { callRepository as calls } from '../worker';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';
import { Call } from '../models/Call';

const fetch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    res.json((req.resource.call as Call).toDocument());
  } catch (error) {
    return next(error);
  }
};

const getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await calls.getByUser(req.jwt.user, 0, 50);

    res.json(list.map((call) => call.toDocument()));
  } catch (error) {
    return next(error);
  }
};

export const CallController = {
  fetch,
  getAll,
};
