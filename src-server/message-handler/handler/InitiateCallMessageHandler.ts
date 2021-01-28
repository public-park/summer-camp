import { getCallerId } from '../../controllers/callback/PhoneHelper';
import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallDirection } from '../../models/CallDirection';
import { CallStatus } from '../../models/CallStatus';
import { CallMessage } from '../../models/socket/messages/CallMessage';
import { ErrorMessage } from '../../models/socket/messages/ErrorMessage';
import { InitiateCallMessage } from '../../models/socket/messages/InitiateCallMessage';
import { Message } from '../../models/socket/messages/Message';
import { UserWithSocket } from '../../models/UserWithSocket';
import { callRepository as calls } from '../../worker';
import { AcknowledgeMessageHandler } from '../AcknowledgeMessageHandler';

const handle = async (
  user: UserWithSocket,
  message: InitiateCallMessage,
  acknowledge: AcknowledgeMessageHandler
): Promise<CallMessage | ErrorMessage> => {
  const configuration = user.getPhoneConfiguration(user.account);

  if (configuration.direction === 'none' || configuration.direction === 'inbound') {
    throw new InvalidConfigurationException();
  }

  const call = await calls.create(
    user.account,
    getCallerId(user.account),
    message.payload.to,
    CallDirection.Outbound,
    CallStatus.Initiated,
    user
  );

  acknowledge.on(message.header.id, async (message: Message) => {
    try {
      await new TwilioHelper(user.account).initiateOutgoingCall(call, user, user.account);
    } catch (error) {
      user.broadcast(
        new ErrorMessage(
          'The call could not be initiated, please check your Twilio account and the phone configuration'
        ) // TODO create single file for text errors
      );
    }
  });

  return new CallMessage(call, message.header.id);
};

export const InitiateCallMessageHandler = {
  handle,
};
