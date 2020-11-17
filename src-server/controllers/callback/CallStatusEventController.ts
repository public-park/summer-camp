import { NextFunction, Response } from 'express';
import { callRepository as calls } from '../../worker';
import { getStatus, getDuration } from './CallStatusEventHelper';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';
import { Call } from '../../models/Call';

const handle = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const call = request.resource.call as Call;

    call.status = getStatus(request);
    call.duration = getDuration(request);

    if (call.direction === CallDirection.Outbound) {
      call.callSid = request.body.CallSid;
    }
    if (call.status === CallStatus.InProgress) {
      call.answeredAt = new Date();
    }

    await calls.save(call);

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

export const CallStatusEventController = {
  handle,
};
