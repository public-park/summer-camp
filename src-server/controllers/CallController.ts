import { Response, NextFunction } from 'express';
import { callRepository as calls } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { RequestWithCall } from '../requests/RequestWithCall';

const fetch = async (req: RequestWithCall, res: Response, next: NextFunction) => {
  try {
    res.json(req.call.toDocument());
  } catch (error) {
    return next(error);
  }
};

const getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const list = await calls.getByUser(req.user, 0, 50);

    res.json(list);
  } catch (error) {
    return next(error);
  }
};

export const CallController = {
  fetch,
  getAll,
};
