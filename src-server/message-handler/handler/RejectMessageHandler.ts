import { callRepository as calls } from '../../worker';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { User } from '../../models/User';
import { RejectMessage } from '../../models/socket/messages/RejectMessage';

const handle = async (user: User, message: RejectMessage): Promise<RejectMessage> => {
  const call = await calls.getById(message.payload.id);

  if (!call) {
    throw new CallNotFoundException();
  }

  await new TwilioHelper(await user.getAccount()).endCall(call);

  return new RejectMessage(message.payload.id, message.header.id);
};

export const RejectMessageHandler = {
  handle,
};
