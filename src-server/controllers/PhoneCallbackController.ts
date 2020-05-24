import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { accountRepository, socketWorker, userRepository } from '../worker';
import { RequestWithUser } from '../requests/RequestWithUser';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { InvalidConfigurationException } from '../exceptions/InvalidConfigurationException';
import { ConfigurationNotFoundException } from '../exceptions/ConfigurationNotFoundException';
import { getIdentity } from '../helpers/twilio/TwilioHelper';
import { InvalidRequestBodyException } from '../exceptions/InvalidRequestBodyException';
import { log } from '../logger';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';

const getTrackerUrl = (request: RequestWithUser) => {
  return `${request.protocol}://${request.hostname}/api/callback/users/${request.user.id}/phone/status-event`;
};

const getCallerId = async (user: User): Promise<string> => {
  const account = await accountRepository.getById(user.accountId);

  if (!account) {
    throw new AccountNotFoundException();
  }

  if (!account.configuration) {
    throw new ConfigurationNotFoundException();
  }

  if (account.configuration.outbound.isEnabled === false) {
    throw new InvalidConfigurationException('configuration has outbound disabled');
  }

  const callerId = account.configuration?.outbound.phoneNumber;

  if (!callerId) {
    throw new InvalidConfigurationException('configuration has outbound enabled, but no phone number is missing');
  }

  return callerId;
};

const rejectInboundToUser = (req: RequestWithUser) => {
  let twiml = new VoiceResponse();

  const say = twiml.say(
    {
      language: 'en-US',
      voice: 'Polly.Salli-Neural',
    },
    'The person you try to call is currently not available'
  );

  return twiml;
};

const connectInboundToUser = (req: RequestWithUser) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial();

  dial.client(
    {
      statusCallbackEvent: ['ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      statusCallback: getTrackerUrl(req),
    },
    getIdentity(req.user)
  );

  return twiml;
};

const handleOutgoing = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const user = await userRepository.getById(<string>req.headers.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    req.user = user;

    let twiml = new VoiceResponse();

    const callerId = await getCallerId(user);

    const dial = twiml.dial({ callerId: callerId });

    dial.number(
      {
        statusCallbackEvent: ['ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        statusCallback: getTrackerUrl(req),
      },
      req.body.PhoneNumber
    );

    res.status(200).send(twiml.toString());
  } catch (error) {
    return next(error);
  }
};

const handleIncoming = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.body.To) {
      throw new InvalidRequestBodyException("request is missing the 'To' parameter");
    }

    log.info(`${req.body.To} called`);

    const user = await userRepository.getById(<string>req.headers.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    req.user = user;

    let twiml: VoiceResponse;

    if (user.isAvailable && socketWorker.isOnline(user.id)) {
      twiml = connectInboundToUser(req);
    } else {
      twiml = rejectInboundToUser(req);
    }

    res.status(200).send(twiml.toString());
  } catch (error) {
    return next(error);
  }
};

const handleStatusEvent = async (req: RequestWithUser, res: Response) => {
  res.status(200).end();
};

export const PhoneCallbackController = {
  handleOutgoing,
  handleIncoming,
  handleStatusEvent,
};
