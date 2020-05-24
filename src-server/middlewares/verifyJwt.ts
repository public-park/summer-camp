import { Request, Response, NextFunction } from 'express';
import { TokenHelper } from '../helpers/TokenHelper';
import { InvalidTokenException } from '../exceptions/InvalidTokenException';
import { log } from '../logger';

export const verifyJwt = (request: Request, response: Response, next: any) => {
  const token = request.get('Token');

  if (!token) {
    return next(new InvalidTokenException('no token provided'));
  }

  try {
    const payload = TokenHelper.verifyJwt(token);

    request.headers.userId = payload.id;

    next();
  } catch (error) {
    log.debug(error);

    switch (error.name) {
      case 'JsonWebTokenError':
        return next(new InvalidTokenException('token payload invalid'));
      case 'TokenExpiredError':
        return next(new InvalidTokenException('token expired'));
      case 'NotBeforeError':
        return next(new InvalidTokenException('token invalid - nbf claim'));
      default:
        return next(new InvalidTokenException('token invalid'));
    }
  }
};
