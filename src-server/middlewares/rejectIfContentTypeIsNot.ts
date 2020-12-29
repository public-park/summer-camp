import { Request, Response, NextFunction } from 'express';
import { InvalidContentTypeException } from '../exceptions/InvalidContentTypeException';

type ContentType = 'application/json' | 'text/plain';

export const rejectIfContentTypeIsNot = (contentType: ContentType) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (request.is(contentType)) {
      return next();
    } else {
      return next(new InvalidContentTypeException());
    }
  };
};
