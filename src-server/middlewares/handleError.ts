import { Request, Response, NextFunction } from 'express';
import { ApplicationException } from '../exceptions/ApplicationException';
import { log } from '../logger';

export const handleError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApplicationException) {
    res.set('Content-Type', 'application/json');
    res.status(error.status).json(error.toResponse());
  } else {
    log.error(error);
    res.status(500).end();
  }
};
