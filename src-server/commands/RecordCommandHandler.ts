import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { CallStatus } from '../models/CallStatus';
import { CallNotInProgressException } from '../exceptions/CallNotInProgressException';
import { callRepository as calls } from '../worker';
import { TwilioHelper } from '../helpers/twilio/TwilioHelper';
import { CallNotFoundException } from '../exceptions/CallNotFoundException';

const handle = async (user: UserWithOnlineState, callId: string, state: boolean) => {
  const call = await calls.getById(callId);

  if (!call) {
    throw new CallNotFoundException();
  }

  if (call.status !== CallStatus.InProgress) {
    throw new CallNotInProgressException();
  }

  const helper = new TwilioHelper(user.account);

  const res = await helper.setRecording(call, state);

  return state;
};

export const RecordCommandHandler = {
  handle,
};
