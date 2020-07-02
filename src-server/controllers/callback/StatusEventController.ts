import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { NextFunction, Response } from 'express';
import { pool, callRepository as calls } from '../../worker';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { parseRequest } from './StatusEventHelper';
import { CallNotFoundError } from '../../repository/CallNotFoundError';

const handle = async (request: RequestWithAccount, response: Response, next: NextFunction) => {
  try {
    const call = await calls.getById(request.params.callId);

    if (!call) {
      throw new CallNotFoundError();
    }

    const event = parseRequest(request);

    await calls.updateStatus(request.params.callId, event.callSid, event.status, event.duration);

    if (['no-answer', 'completed', 'failed', 'busy'].includes(event.status) && call.userId) {
      const user = await pool.getUserById(call.userId);

      if (!user) {
        throw new UserNotFoundException();
      }

      user.isOnACall = false;
    }

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

export const StatusEventController = {
  handle,
};
