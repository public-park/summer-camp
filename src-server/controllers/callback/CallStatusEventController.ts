import { NextFunction, Response } from 'express';
import { pool, callRepository as calls } from '../../worker';
import { getStatus, getDuration } from './CallStatusEventHelper';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';

const handleInbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const user = pool.getByIdOrFail(<string>request.call.userId);

    request.call.status = getStatus(request);

    await calls.update(request.call);

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleOutbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const user = pool.getByIdOrFail(<string>request.call.userId);

    request.call.callSid = request.body.CallSid;
    request.call.status = getStatus(request);
    request.call.duration = getDuration(request);

    request.call = await calls.update(request.call);

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

export const CallStatusEventController = {
  handleInbound,
  handleOutbound,
};
