import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { callRepository } from '../worker';
import { getCallerId } from '../controllers/callback/PhoneHelper';
import { CallDirection } from '../models/CallDirection';
import { CallStatus } from '../models/CallStatus';

// TODO add command request, response interface
const handle = async (user: UserWithOnlineState, phoneNumber: string) => {
  const callerId = getCallerId(user.account);

  const payload = {
    direction: CallDirection.Outbound,
    to: phoneNumber,
    from: callerId,
    callSid: undefined,
    status: CallStatus.Initiated,
  };

  const call = await callRepository.create(payload, user.account, user);

  user.call = call;

  return call;
};

export const CallCommandHandler = {
  handle,
};
