import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { callRepository as calls, pool } from '../../worker';
import { log } from '../../logger';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { getStatus, getDuration, getFinalInboundCallState } from './CallStatusEventHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { getCallbackUrl } from './PhoneHelper';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';
import { UserWithSocket } from '../../models/UserWithSocket';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { Account } from '../../models/Account';

const generateConnectTwiml = async (req: StatusCallbackRequest, user: UserWithSocket) => {
  const { CallSid, From, To } = req.body;

  const call = await calls.create(
    req.resource.account as Account,
    From,
    To,
    CallDirection.Inbound,
    CallStatus.Initiated,
    user,
    CallSid
  );

  let twiml = new VoiceResponse();

  const dial = twiml.dial({ callerId: call.from });

  const options: any = {
    endConferenceOnExit: true,
    statusCallbackEvent: ['join'],
    statusCallback: getCallbackUrl(
      `status-callback/accounts/${call.accountId}/calls/${call.id}/conference/${call.direction}`
    ),
    participantLabel: 'customer',
  };

  dial.conference(options, call.id);

  return twiml.toString();
};

const generateEnqueueTwiml = async (req: StatusCallbackRequest) => {
  const { CallSid, From, To } = req.body;

  const call = await calls.create(
    req.resource.account as Account,
    From,
    To,
    CallDirection.Inbound,
    CallStatus.Queued,
    undefined,
    CallSid
  );

  let twiml = new VoiceResponse();

  const dial = twiml.dial();
  // VoiceResponse.ConferenceAttributes
  const options: any = {
    endConferenceOnExit: true,
    participantLabel: 'customer',
  };

  dial.conference(options, call.id);

  return twiml.toString();
};

export const generateRejectTwiml = async (req: StatusCallbackRequest, user?: UserWithSocket) => {
  const { CallSid, From, To } = req.body;

  await calls.create(
    req.resource.account as Account,
    From,
    To,
    CallDirection.Inbound,
    CallStatus.NoAnswer,
    user,
    CallSid
  );

  let twiml = new VoiceResponse();

  twiml.say(
    {
      language: 'en-US',
      voice: 'Polly.Salli-Neural',
    },
    'The person you try to call is currently not available'
  );

  return twiml.toString();
};

const handleConnectWithFilter = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    let users: Array<UserWithSocket> = pool.getAll(req.resource.account as Account);

    const tag = req.query.tag?.toString();

    if (tag) {
      users = users.filter((user) => user.tags.has(tag) && user.isAvailable);
    } else {
      users = users.filter((user) => user.isAvailable);
    }

    if (users.length !== 0) {
      const user = users[(Math.random() * users.length) | 0];

      res.status(200).send(await generateConnectTwiml(req, user));
    } else {
      res.status(200).send(await generateRejectTwiml(req));
    }
  } catch (error) {
    return next(error);
  }
};

const handleConnectToUser = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    const user = await pool.getOneByAccountWithFallback(req.resource.account as Account);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.sockets.length() > 0 && user.isAvailable) {
      res.status(200).send(await generateConnectTwiml(req, user));
    } else {
      res.status(200).send(await generateRejectTwiml(req, user));
    }
  } catch (error) {
    return next(error);
  }
};

const handleCompleted = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  try {
    let call = await calls.getByCallSid(req.body.CallSid);

    if (!call) {
      throw new CallNotFoundException();
    }

    let status = getStatus(req);

    /* override the status if the call was not accepted */
    call.status = getFinalInboundCallState(call.status, status);

    if (call.status !== CallStatus.NoAnswer) {
      call.duration = getDuration(req);
    }

    await calls.save(call);

    res.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleEnqueue = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    res.status(200).send(generateEnqueueTwiml(req));
  } catch (error) {
    return next(error);
  }
};

export const PhoneInboundController = {
  handleConnectToUser,
  handleConnectWithFilter,
  handleEnqueue,
  handleCompleted,
};
