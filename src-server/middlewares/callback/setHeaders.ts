import { Request, Response, NextFunction } from 'express';

export const setHeaders = (request: Request, response: Response, next: NextFunction) => {
  response.setHeader('Content-Type', 'application/xml');
  response.setHeader('Cache-Control', 'public, max-age=0');

  next();
};
