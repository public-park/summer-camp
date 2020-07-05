import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { callRepository as calls, pool } from '../../worker';
import { log } from '../../logger';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { CallDirection } from '../../models/CallDirection';
import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { CallStatus } from '../../models/CallStatus';
import { parseRequest } from './StatusEventHelper';
import { User } from '../../models/User';
import { getStatusEventUrl } from './PhoneHelper';
import { getIdentity } from '../../helpers/twilio/TwilioHelper';
import { Call } from '../../models/Call';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';

const generateEnqueueTwiml = (req: RequestWithAccount, call: Call) => {
  let twiml = new VoiceResponse();

  twiml.dial().conference(call.id);

  return twiml.toString();
};

const generateConnectTwiml = (statusEventUrl: string, user: User) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial();

  dial.client(
    {
      statusCallbackEvent: ['ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      statusCallback: statusEventUrl,
    },
    getIdentity(user)
  );

  return twiml.toString();
};

export const generateRejectTwiml = () => {
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

    let users: Array<UserWithOnlineState> = pool.getOnlineByAccount(req.account);
    const tag = req.query.tag?.toString();

    if (tag) {
      users = users.filter((user) => user.tags.has(tag) && user.isAvailable);
    } else {
      users = users.filter((user) => user.isAvailable);
    }

    if (users.length !== 0) {
      const user = users[(Math.random() * users.length) | 0];

      user.isOnACall = true;

      const payload = {
        ...parseRequest(req),
        direction: CallDirection.Inbound,
      };

      const call = await calls.create(payload, req.account, user);

      const statusEventUrl = getStatusEventUrl(req, req.account, call, CallDirection.Inbound);

      res.status(200).send(generateConnectTwiml(statusEventUrl, user));
    } else {
      const payload = {
        ...parseRequest(req),
        userId: undefined,
        accountId: req.account.id,
        direction: CallDirection.Inbound,
      };

      res.status(200).send(generateRejectTwiml());
    }
  } catch (error) {
    return next(error);
  }
};

const handleConnectToUser = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    const user = await pool.getFirstByAccount(req.account);

    if (!user) {
      throw new UserNotFoundException();
    }

    const payload = {
      ...parseRequest(req, user),
      direction: CallDirection.Inbound,
    };

    const call = await calls.create(payload, req.account, user);

    if (user.isOnline && user.isAvailable) {
      user.isOnACall = true;

      const statusEventUrl = getStatusEventUrl(req, req.account, call, CallDirection.Inbound);

      res.status(200).send(generateConnectTwiml(statusEventUrl, user));
    } else {
      res.status(200).send(generateRejectTwiml());
    }
  } catch (error) {
    return next(error);
  }
};

const handleCompleted = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    const event = parseRequest(req);

    const call = await calls.getByCallSid(req.body.CallSid);

    if (!call) {
      throw new CallNotFoundException();
    }

    // manually override the status if the call was not accepted
    if (call.status && [CallStatus.NoAnswer, CallStatus.Ringing, CallStatus.Queued].includes(call.status)) {
      event.status = CallStatus.NoAnswer;
    }

    await calls.updateStatus(call.id, event.callSid, event.status, event.duration);

    res.status(200).end();
  } catch (error) {
    return next(error);
  }
};

const handleEnqueue = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    log.info(`${req.body.To} called`);

    const payload = {
      ...parseRequest(req),
      direction: CallDirection.Inbound,
      status: CallStatus.Queued,
    };

    const call = await calls.create(payload, req.account);

    res.status(200).send(generateEnqueueTwiml(req, call));
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
