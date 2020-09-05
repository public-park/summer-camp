import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { callRepository } from '../worker';
import { TwilioHelper } from '../helpers/twilio/TwilioHelper';
import { CallNotFoundException } from '../exceptions/CallNotFoundException';

// TODO, use call pool
const handle = async (user: UserWithOnlineState, callId: string) => {
  const call = await callRepository.getById(callId);

  if (!call) {
    throw new CallNotFoundException();
  }

  const helper = new TwilioHelper(user.account);

  await helper.addUserToConference(call);

  return;
};

export const AcceptCommandHandler = {
  handle,
};
