import { getCallerId } from '../../controllers/callback/PhoneHelper';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallDirection } from '../../models/CallDirection';
import { CallStatus } from '../../models/CallStatus';
import { CallMessage } from '../../models/socket/messages/CallMessage';
import { ErrorMessage } from '../../models/socket/messages/ErrorMessage';
import { InitiateCallMessage } from '../../models/socket/messages/InitiateCallMessage';
import { User } from '../../models/User';
import { callRepository as calls } from '../../worker';
import { AcknowledgeMessageHandler } from '../AcknowledgeMessageHandler';

const handle = async (
  user: User,
  message: InitiateCallMessage,
  acknowledge: AcknowledgeMessageHandler
): Promise<CallMessage | ErrorMessage> => {
  const configuration = await user.getPhoneConfiguration();
  const account = await user.getAccount();

  if (configuration.direction === 'none' || configuration.direction === 'inbound') {
    throw new InvalidConfigurationException();
  }

  const call = await calls.create(
    user.accountId,
    getCallerId(account),
    message.payload.to,
    CallDirection.Outbound,
    CallStatus.Initiated,
    user
  );

  acknowledge.on(message.header.id, async () => {
    try {
      await new TwilioHelper(account).initiateOutgoingCall(call, user, account);
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
