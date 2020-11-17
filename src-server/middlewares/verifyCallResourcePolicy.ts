import { Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { callRepository } from '../worker';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { CallNotFoundException } from '../exceptions/CallNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

export const verifyCallResourcePolicy = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
  callId: string
) => {
  try {
    if (!isUUID(callId)) {
      throw new InvalidUrlException('callId is not a valid UUID');
    }

    const call = await callRepository.getById(callId);

    if (!call || call.accountId !== request.jwt.user.accountId) {
      throw new CallNotFoundException();
    }

    request.resource = {
      ...request.resource,
      call,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
