import { Response, NextFunction } from 'express';
import isUUID from 'validator/lib/isUUID';
import { InvalidUrlException } from '../../exceptions/InvalidUrlException';
import { callRepository as calls } from '../../worker';
import { ServerException } from '../../exceptions/ServerException';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';

export const addCallToRequest = async (
  request: StatusCallbackRequest,
  response: Response,
  next: NextFunction,
  callId: string
) => {
  try {
    if (!isUUID(callId)) {
      return next(new InvalidUrlException('callId is not a valid UUID'));
    }

    const call = await calls.getById(callId);

    if (!call) {
      return next(new CallNotFoundException());
    }

    request.resource = {
      ...request.resource,
      call,
    };

    return next();
  } catch (error) {
    return next(new ServerException());
  }
};
