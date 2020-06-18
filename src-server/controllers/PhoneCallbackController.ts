import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { callRepository, pool } from '../worker';
import { InvalidConfigurationException } from '../exceptions/InvalidConfigurationException';
import { ConfigurationNotFoundException } from '../exceptions/ConfigurationNotFoundException';
import { getIdentity } from '../helpers/twilio/TwilioHelper';
import { log } from '../logger';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { CallDirection } from '../models/CallDirection';
import { RequestWithAccount } from '../requests/RequestWithAccount';
import { CallStatus } from '../models/CallStatus';
import { CallData } from '../repository/CallRepository';
import { StatusCallbackHelper } from './helpers/StatusCallbackHelper';

const getCallerId = async (account: Account): Promise<string> => {
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

const rejectInboundToUser = (req: RequestWithAccount, user: User) => {
  let twiml = new VoiceResponse();

  twiml.say(
    {
      language: 'en-US',
      voice: 'Polly.Salli-Neural',
    },
    'The person you try to call is currently not available'
  );

  return twiml;
};

const connectInboundToUser = (req: RequestWithAccount, user: User) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial();

  dial.client(
    {
      statusCallbackEvent: ['ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      statusCallback: StatusCallbackHelper.getStatusEventUrl(req, CallDirection.Inbound),
    },
    getIdentity(user)
  );

  return twiml;
};

const handleOutgoing = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    const user = await pool.getOneByAccount(req.account);

    if (!user) {
      throw new UserNotFoundException();
    }

    let twiml = new VoiceResponse();

    const callerId = await getCallerId(req.account);

    const dial = twiml.dial({ callerId: callerId });

    //console.log('X: set user to busy');

    dial.number(
      {
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        statusCallback: StatusCallbackHelper.getStatusEventUrl(req, CallDirection.Outbound),
      },
      req.body.PhoneNumber
    );

    res.status(200).send(twiml.toString());
  } catch (error) {
    return next(error);
  }
};

const handleIncoming = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    //  const users = pool.getOnlineUsersByAccount(req.account).filter((user) => user.tags.includes(req.body.tag));

    const user = await pool.getOneByAccount(req.account);

    if (!user) {
      throw new UserNotFoundException();
    }

    let twiml: VoiceResponse;
    let status: CallStatus;

    if (user.isAvailable && user.isOnline) {
      twiml = connectInboundToUser(req, user);
      status = StatusCallbackHelper.fetchStatus(req);
    } else {
      twiml = rejectInboundToUser(req, user);
      status = CallStatus.NoAnswer;
    }

    const data: CallData = {
      callSid: req.body.CallSid,
      from: req.body.From,
      to: req.body.To,
      accountId: req.account.id,
      userId: user.id,
      status: status,
      direction: CallDirection.Inbound,
    };

    await callRepository.create(data);

    user.isOnACall = true;

    res.status(200).send(twiml.toString());
  } catch (error) {
    return next(error);
  }
};

const handleStatusEvent = async (request: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    const user = await pool.getOneByAccount(request.account);

    if (!user) {
      throw new UserNotFoundException();
    }

    let callSid;

    if (request.params.direction === CallDirection.Inbound.toLocaleLowerCase()) {
      callSid = request.body.ParentCallSid;
    } else {
      callSid = request.body.CallSid;
    }

    if (
      request.params.direction === CallDirection.Outbound.toLocaleLowerCase() &&
      request.body.CallStatus === CallStatus.Initiated.toLocaleLowerCase()
    ) {
      const data: CallData = {
        callSid: callSid,
        from: request.body.From,
        to: request.body.To,
        accountId: request.account.id,
        userId: user.id,
        status: StatusCallbackHelper.fetchStatus(request),
        direction: CallDirection.Outbound,
      };

      user.isOnACall = true;

      await callRepository.create(data);
    } else {
      await callRepository.updateStatus(
        callSid,
        StatusCallbackHelper.fetchStatus(request),
        StatusCallbackHelper.fetchDuration(request)
      );

      if (['no-answer', 'completed', 'failed', 'busy'].includes(StatusCallbackHelper.fetchStatus(request))) {
        user.isOnACall = false;
      }
    }

    res.status(200).end();
  } catch (error) {
    return next(error);
  }
};

export const PhoneCallbackController = {
  handleOutgoing,
  handleIncoming,
  handleStatusEvent,
};
