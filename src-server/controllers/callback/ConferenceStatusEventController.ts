import { NextFunction, Response } from 'express';
import { userRepository } from '../../worker';
import { TwilioHelper, convertIdentityToUserId } from '../../helpers/twilio/TwilioHelper';
import { CallDirection } from '../../models/CallDirection';
import { log } from '../../logger';
import { Call } from '../../models/Call';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';

const isFirstInboundParticipant = (call: Call, from: string, to: string) => {
  if (call.direction === CallDirection.Inbound) {
    return call.from === from && call.to === to;
  }
};

const isFirstOutboundParticipant = (call: Call, from: string) => {
  if (call.direction === CallDirection.Outbound) {
    return convertIdentityToUserId(from) === call.userId;
  }
};

const validateConferenceEvent = (event: string) => {
  if (event !== 'participant-join') {
    throw new InvalidRequestBodyException(`got ${event} instead of participant-join`);
  }
};

const handleInbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const user = await userRepository.getById(request.account, <string>request.call.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    validateConferenceEvent(request.body.StatusCallbackEvent);

    const helper = new TwilioHelper(request.account);

    const { from, to } = await helper.getCall(request.body.CallSid);

    if (isFirstInboundParticipant(request.call, from, to)) {
      log.info(`${request.body.ConferenceSid}, number ${request.call.from} joined, adding user ${request.call.userId}`);

      await helper.addUserToConference(request, request.call);
    }

    response.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleOutbound = async (request: StatusCallbackRequest, response: Response, next: NextFunction) => {
  try {
    const user = await userRepository.getById(request.account, <string>request.call.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    validateConferenceEvent(request.body.StatusCallbackEvent);

    const helper = new TwilioHelper(request.account);

    const { from } = await helper.getCall(request.body.CallSid);

    if (isFirstOutboundParticipant(request.call, from)) {
      log.info(`${request.body.ConferenceSid}, user ${request.call.userId} joined, adding number ${request.call.to}`);

      await helper.addCustomerToConference(request, request.call);
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
