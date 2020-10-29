import { NextFunction, Response } from 'express';
import { callRepository as calls } from '../../worker';
import { getStatus, getDuration } from './CallStatusEventHelper';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { CallStatus } from '../../models/CallStatus';

const handleInbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    request.call.status = getStatus(request);

    if (request.call.status === CallStatus.InProgress) {
      request.call.answeredAt = new Date();
    }

    await calls.update(request.call);

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleOutbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    request.call.callSid = request.body.CallSid;
    request.call.status = getStatus(request);
    request.call.duration = getDuration(request);

    if (request.call.status === CallStatus.InProgress) {
      request.call.answeredAt = new Date();
    }

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
