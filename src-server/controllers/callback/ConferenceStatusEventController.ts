import { NextFunction, Response } from 'express';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { log } from '../../logger';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';
import { callRepository as calls } from '../../worker';
import { CallStatus } from '../../models/CallStatus';
import { Call } from '../../models/Call';

const rejectIfNotJoinEvent = (event: string) => {
  if (event !== 'participant-join') {
    throw new InvalidRequestBodyException(`got ${event} instead of participant-join`);
  }
};

const handleInbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  const {
    body: { ParticipantLabel, ConferenceSid, StatusCallbackEvent, CallSid },
  } = request;

  const call = request.resource.call as Call;

  try {
    rejectIfNotJoinEvent(StatusCallbackEvent);

    if (ParticipantLabel === 'customer') {
      log.info(`${ConferenceSid}, number ${call.from} joined, adding user ${call.userId}`);

      call.status = CallStatus.Ringing;
      call.callSid = CallSid;

      await calls.save(call);
    }

    response.status(200).end();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const handleOutbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  const {
    body: { ParticipantLabel, ConferenceSid, StatusCallbackEvent },
  } = request;

  const call = request.resource.call as Call;

  try {
    rejectIfNotJoinEvent(StatusCallbackEvent);

    if (ParticipantLabel === 'agent') {
      log.info(`${ConferenceSid}, user ${call.userId} joined, adding number ${call.to}`);

      const helper = new TwilioHelper(request.resource.account); // TODO add helper to request

      call.callSid = await helper.addCustomerToConference(call);

      await calls.save(call);
    }

    response.status(200).end();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export const ConferenceStatusEventController = {
  handleInbound,
  handleOutbound,
};
