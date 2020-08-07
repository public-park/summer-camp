import { NextFunction, Response } from 'express';
import { pool, callRepository as calls, callRepository } from '../../worker';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { getStatus, getDuration } from './CallStatusEventHelper';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { CallStatus } from '../../models/CallStatus';
import { InvalidCallStatusException } from '../../exceptions/InvalidCallStatusException';

const handleInbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const user = await pool.getById(<string>request.call.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const event = {
      callSid: request.body.CallSid,
      from: request.body.From,
      to: request.body.To,
      status: getStatus(request),
      duration: getDuration(request),
    };

    if ([CallStatus.Initiated, CallStatus.Completed].includes(event.status)) {
      response.status(200).end();
      return;
    }

    if ([CallStatus.Ringing].includes(event.status)) {
      /* broadcast child-leg to user */
      user.updateCallAndBroadcast(request.call);

      response.status(200).end();
      return;
    }

    if ([CallStatus.InProgress].includes(event.status)) {
      const call = await calls.updateStatus(request.call.id, event.status, undefined, event.duration);

      user.updateCallAndBroadcast(call);

      response.status(200).end();
      return;
    }

    throw new InvalidCallStatusException();
  } catch (error) {
    return next(error);
  }
};

const handleOutbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const user = await pool.getById(<string>request.call.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const event = {
      callSid: request.body.CallSid,
      from: request.body.From,
      to: request.body.To,
      status: getStatus(request),
      duration: getDuration(request),
    };

    /* always override the callSid with the outobund leg */
    const callSid = event.callSid;

    const call = await calls.updateStatus(request.call.id, event.status, callSid, event.duration);

    /* the initiated state was already published initially when the call was created by the user */
    if (event.status !== CallStatus.Initiated) {
      user.updateCallAndBroadcast(call);
    }

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

export const CallStatusEventController = {
  handleInbound,
  handleOutbound,
};
