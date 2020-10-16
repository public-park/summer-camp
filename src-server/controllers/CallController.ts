import { Response, NextFunction } from 'express';
import { callRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { RequestWithCall } from '../requests/RequestWithCall';

const fetch = async (req: RequestWithCall, res: Response, next: NextFunction) => {
  try {
    res.json(req.call.toResponse());
  } catch (error) {
    return next(error);
  }
};

const getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const calls = await callRepository.getByUser(req.user, 0, 50);

    res.json(calls);
  } catch (error) {
    return next(error);
  }
};

export const CallController = {
  fetch,
  getAll,
};
