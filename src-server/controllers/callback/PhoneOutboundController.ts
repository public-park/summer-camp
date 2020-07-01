import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { pool, callRepository, accountRepository } from '../../worker';
import { UserNotFoundException } from '../../exceptions/UserNotFoundException';
import { CallDirection } from '../../models/CallDirection';
import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { getStatusEventUrl, getCallerId } from './PhoneHelper';
import { AccountNotFoundError } from '../../repository/AccountNotFoundError';

const generateDialTwiml = (statusEventUrl: string, callerId: string, phoneNumber: string) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial({ callerId: callerId });

  dial.number(
    {
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      statusCallback: statusEventUrl,
    },
    phoneNumber
  );

  return twiml.toString();
};

const handle = async (req: RequestWithAccount, res: Response, next: NextFunction) => {
  try {
    const user = await pool.getUserById(req.body.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const account = await accountRepository.getById(user.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    const callerId = getCallerId(req.account);

    const payload = {
      userId: user.id,
      accountId: user.accountId,
      direction: CallDirection.Outbound,
      to: req.body.PhoneNumber,
      from: callerId,
      callSid: undefined,
      status: undefined,
    };

    const call = await callRepository.create(payload);

    const statusEventUrl = getStatusEventUrl(req, account, call, CallDirection.Outbound);

    user.isOnACall = true;

    res.status(200).send(generateDialTwiml(statusEventUrl, callerId, req.body.PhoneNumber));
  } catch (error) {
    return next(error);
  }
};

export const PhoneOutboundController = {
  handle,
};
