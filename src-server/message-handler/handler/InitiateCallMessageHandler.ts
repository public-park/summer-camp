import { getCallerId } from '../../controllers/callback/PhoneHelper';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallDirection } from '../../models/CallDirection';
import { CallStatus } from '../../models/CallStatus';
import { CallMessage } from '../../models/socket/messages/CallMessage';
import { InitiateCallMessage } from '../../models/socket/messages/InitiateCallMessage';
import { Message } from '../../models/socket/messages/Message';
import { UserWithSocket } from '../../models/UserWithSocket';
import { callRepository as calls } from '../../worker';
import { AcknowledgeMessageHandler } from '../AcknowledgeMessageHandler';

const handle = async (
  user: UserWithSocket,
  message: InitiateCallMessage,
  acknowledge: AcknowledgeMessageHandler
): Promise<CallMessage> => {
  const callerId = getCallerId(user.account);

  const call = await calls.create(
    callerId,
    message.payload.to,
    user.account,
    CallStatus.Initiated,
    CallDirection.Outbound,
    user
  );

  acknowledge.on(message.header.id, async (message: Message) => {
    await new TwilioHelper(user.account).connectUser(call, user);
  });

  return new CallMessage(call, message.header.id);
};

export const InitiateCallMessageHandler = {
  handle,
};
