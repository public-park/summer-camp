import { NextFunction, Response } from 'express';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { log } from '../../logger';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';
import { callRepository as calls, pool } from '../../worker';
import { CallStatus } from '../../models/CallStatus';

const rejectIfNotJoinEvent = (event: string) => {
  if (event !== 'participant-join') {
    throw new InvalidRequestBodyException(`got ${event} instead of participant-join`);
  }
};

const handleInbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    rejectIfNotJoinEvent(request.body.StatusCallbackEvent);

    if (request.body.ParticipantLabel === 'customer') {
      log.info(`${request.body.ConferenceSid}, number ${request.call.from} joined, adding user ${request.call.userId}`);

      request.call.status = CallStatus.Ringing;

      await calls.update(request.call);
    }

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleOutbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    rejectIfNotJoinEvent(request.body.StatusCallbackEvent);

    if (request.body.ParticipantLabel === 'agent') {
      log.info(`${request.body.ConferenceSid}, user ${request.call.userId} joined, adding number ${request.call.to}`);

      const helper = new TwilioHelper(request.account);

      await helper.addCustomerToConference(request.call);
    }

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

export const ConferenceStatusEventController = {
  handleInbound,
  handleOutbound,
};
