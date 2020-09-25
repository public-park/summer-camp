import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { callRepository as calls } from '../worker';
import { getCallerId } from '../controllers/callback/PhoneHelper';
import { CallDirection } from '../models/CallDirection';
import { CallStatus } from '../models/CallStatus';
import { TwilioHelper } from '../helpers/twilio/TwilioHelper';

const handle = async (user: UserWithOnlineState, to: string) => {
  const callerId = getCallerId(user.account);

  const call = await calls.create(callerId, to, user.account, CallStatus.Initiated, CallDirection.Outbound, user);

  const helper = new TwilioHelper(user.account);

  await helper.connectUser(call, user);

  return call;
};

export const CallCommandHandler = {
  handle,
};
