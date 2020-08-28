import { UserWithOnlineState } from '../pool/UserWithOnlineState';
import { callRepository as calls } from '../worker';
import { getCallerId } from '../controllers/callback/PhoneHelper';
import { CallDirection } from '../models/CallDirection';
import { CallStatus } from '../models/CallStatus';
import { Call } from '../models/Call';
import { v4 as uuidv4 } from 'uuid';

// TODO add command request, response interface
const handle = async (user: UserWithOnlineState, phoneNumber: string) => {
  const callerId = getCallerId(user.account);

  const call = new Call(
    uuidv4(),
    undefined,
    callerId,
    phoneNumber,
    user.account.id,
    user.id,
    CallStatus.Initiated,
    CallDirection.Outbound
  );

  await calls.create(call);

  user.updateCall(call);

  return call;
};

export const CallCommandHandler = {
  handle,
};
