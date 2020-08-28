import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { callRepository as calls, pool } from '../../worker';
import { log } from '../../logger';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { CallDirection } from '../../models/CallDirection';
import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { CallStatus } from '../../models/CallStatus';
import { getStatus, getDuration, getFinalInboundCallState } from './CallStatusEventHelper';
import { getConferenceStatusEventUrl } from './PhoneHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';
import { Call } from '../../models/Call';
import { v4 as uuidv4 } from 'uuid';

const createCallFromRequest = (req: RequestWithAccount, user: UserWithOnlineState | undefined, status: CallStatus) => {
  const { CallSid, From, To } = req.body;

  return new Call(uuidv4(), CallSid, From, To, req.account.id, user?.id, status, CallDirection.Inbound);
};

const generateConnectTwiml = async (req: RequestWithAccount, user: UserWithOnlineState) => {
  const call = createCallFromRequest(req, user, CallStatus.Initiated);

  await calls.create(call);

  user.updateCall(call);

  let twiml = new VoiceResponse();

  const dial = twiml.dial({ callerId: call.from });

  const options: any = {
    endConferenceOnExit: true,
    statusCallbackEvent: ['join'],
    statusCallback: getConferenceStatusEventUrl(req, call),
    participantLabel: 'customer',
  };

  dial.conference(options, call.id);

  return twiml.toString();
};

const generateEnqueueTwiml = async (req: RequestWithAccount) => {
  const call = createCallFromRequest(req, undefined, CallStatus.Queued);

  await calls.create(call);

  let twiml = new VoiceResponse();

  const dial = twiml.dial();
  // VoiceResponse.ConferenceAttributes
  const options: any = {
    endConferenceOnExit: true,
    participantLabel: 'customer',
  };

  dial.conference(options, call.id);
  console.log(twiml.toString());
  return twiml.toString();
};

export const generateRejectTwiml = async (req: RequestWithAccount, user?: UserWithOnlineState) => {
  const call = createCallFromRequest(req, user, CallStatus.NoAnswer);

  await calls.create(call);

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

const handleConnectWithFilter = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    let users: Array<UserWithOnlineState> = pool.getAll(req.account);

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

const handleConnectToUser = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    const user = await pool.getOneByAccountWithFallback(req.account);

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

const handleCompleted = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    let call = await calls.getByCallSid(req.body.CallSid);

    if (!call) {
      throw new CallNotFoundException();
    }

    let status = getStatus(req);

    /* override the status if the call was not accepted */
    call.status = getFinalInboundCallState(call.status, status);

    if (status !== CallStatus.NoAnswer) {
      call.duration = getDuration(req);
    }

    await calls.update(call);

    res.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleEnqueue = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
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
