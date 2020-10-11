import { getCallerId } from '../../controllers/callback/PhoneHelper';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallDirection } from '../../models/CallDirection';
import { CallStatus } from '../../models/CallStatus';
import { CallMessage } from '../../models/socket/messages/CallMessage';
import { InitiateCallMessage } from '../../models/socket/messages/InitiateCallMessage';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';

import { callRepository as calls } from '../../worker';

const handle = async (user: UserWithOnlineState, message: InitiateCallMessage): Promise<CallMessage> => {
  const callerId = getCallerId(user.account);

  const call = await calls.create(
    callerId,
    message.payload.to,
    user.account,
    CallStatus.Initiated,
    CallDirection.Outbound,
    user
  );

  const helper = new TwilioHelper(user.account);

  await helper.connectUser(call, user);

  return new CallMessage(call, message.header.id);
};

export const InitiateCallMessageHandler = {
  handle,
};
