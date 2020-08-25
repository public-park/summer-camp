import { Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { callRepository } from '../worker';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { CallNotFoundException } from '../exceptions/CallNotFoundException';
import { RequestWithCall } from '../requests/RequestWithCall';

export const verifyCallResourcePolicy = async (
  request: RequestWithCall,
  response: Response,
  next: NextFunction,
  callId: string
) => {
  try {
    if (!isUUID(callId)) {
      throw new InvalidUrlException('callId is not a valid UUID');
    }

    const call = await callRepository.getById(callId);
    // TODO add session to request, request.session, request.jwt.user
    if (!call || call.accountId !== request.user.account.id) {
      throw new CallNotFoundException();
    }

    request.call = call;

    return next();
  } catch (error) {
    return next(error);
  }
};
