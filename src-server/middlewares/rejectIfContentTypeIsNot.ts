import { Request, Response, NextFunction } from 'express';
import { InvalidContentTypeException } from '../exceptions/InvalidContentTypeException';

export const rejectIfContentTypeIsNot = (contentType: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (request.is(contentType)) {
      return next();
    } else {
      return next(new InvalidContentTypeException());
    }
  };
};
