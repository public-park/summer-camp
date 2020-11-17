import { Response, NextFunction } from 'express';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { callRepository as calls } from '../../worker';
import { getCallbackUrl } from './PhoneHelper';
import { Call } from '../../models/Call';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';

const generateConnectTwiml = (req: StatusCallbackRequest, call: Call) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial({ callerId: call.from });
  // VoiceResponse.ConferenceAttributes
  const options: any = {
    endConferenceOnExit: true,
    statusCallbackEvent: ['join'],
    statusCallback: getCallbackUrl(
      `status-callback/accounts/${call.accountId}/calls/${call.id}/conference/${call.direction}`
    ),
    participantLabel: 'agent',
  };

  dial.conference(options, call.id);

  return twiml.toString();
};

const handle = async (req: StatusCallbackRequest, res: Response, next: NextFunction) => {
  try {
    const call = await calls.getById(req.params.callId);

    if (!call) {
      throw new CallNotFoundException();
    }

    res.status(200).send(generateConnectTwiml(req, call));
  } catch (error) {
    return next(error);
  }
};

export const PhoneOutboundController = {
  handle,
};
