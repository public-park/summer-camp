import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { CallStatus } from '../models/CallStatus';
import { CallNotInProgressException } from '../exceptions/CallNotInProgressException';
import { callRepository } from '../worker';
import { TwilioHelper } from '../helpers/twilio/TwilioHelper';
import { CallNotFoundException } from '../exceptions/CallNotFoundException';

// TODO, use call pool
const handle = async (user: UserWithOnlineState, callId: string, state: boolean) => {
  const call = await callRepository.getById(callId);

  if (!call) {
    throw new CallNotFoundException();
  }

  if (call.status !== CallStatus.InProgress) {
    throw new CallNotInProgressException();
  }

  const helper = new TwilioHelper(user.account);

  const hold = await helper.holdParticipant(call, 'customer', state);

  return state;
};

export const HoldCommandHandler = {
  handle,
};
