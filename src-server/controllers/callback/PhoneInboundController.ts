import { Response, NextFunction } from 'express';
import { callRepository as calls, pool } from '../../worker';
import { log } from '../../logger';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { getStatus, getDuration, getFinalInboundCallState } from './CallStatusEventHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';
import { UserWithSocket } from '../../models/UserWithSocket';
import { createConferenceTwiml, createEnqueueTwiml, createRejectTwiml } from '../../helpers/twilio/TwilioTwimlHelper';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';
import { Account } from '../../models/Account';

export const handleConnectWithFilter = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  const { From, To, CallSid } = req.body;

  try {
    log.info(`${To} called`);

    let users: Array<UserWithSocket> = pool.getAll(req.resource.account as Account);

    const tag = req.query.tag?.toString();

    if (tag) {
      users = users.filter((user) => user.tags.has(tag) && user.isAvailable && user.isOnline);
    } else {
      users = users.filter((user) => user.isAvailable);
    }

    const user = users[(Math.random() * users.length) | 0];

    const status = users.length !== 0 ? CallStatus.Initiated : CallStatus.NoAnswer;

    const call = await calls.create(req.resource.account as Account, From, To, CallDirection.Inbound, status, user);

    if (user) {
      res.status(200).send(createConferenceTwiml(call, 'customer'));
    } else {
      res.status(200).send(createRejectTwiml());
    }
  } catch (error) {
    return next(error);
  }
};

const handleConnectToUser = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  const { From, To, CallSid } = req.body;
  const account = req.resource.account as Account;

  try {
    log.info(`${To} called`);

    const user = await pool.getOneByAccountWithFallback(req.resource.account as Account);

    if (!user) {
      throw new UserNotFoundException();
    }

    const status = user.isOnline && user.isAvailable ? CallStatus.Initiated : CallStatus.NoAnswer;

    const call = await calls.create(account, From, To, CallDirection.Inbound, status, user, CallSid);

    if (call.status === CallStatus.Initiated) {
      res.status(200).send(createConferenceTwiml(call, 'customer'));
    } else {
      res.status(200).send(createRejectTwiml());
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
  const { From, To } = req.body;

  const call = await calls.create(req.resource.account as Account, From, To, CallDirection.Inbound, CallStatus.Queued);

  try {
    log.info(`${req.body.To} called`);

    res.status(200).send(createEnqueueTwiml(call, 'customer'));
  } catch (error) {
    return next(error);
  }
};

export const PhoneInboundController = {
  handleConnectToUser,
  handleEnqueue,
  handleCompleted,
};
