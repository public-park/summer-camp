import { Request, Response, NextFunction } from 'express';

export const setHeaders = (request: Request, response: Response, next: NextFunction) => {
  response.setHeader('Magic', 'true');
  response.setHeader('Creator', 'Unicorn');
  response.setHeader('X-Powered-By', 'none');

  next();
};
