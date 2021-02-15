import { callRepository as calls } from '../../worker';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { AcceptMessage } from '../../models/socket/messages/AcceptMessage';
import { User } from '../../models/User';

const handle = async (user: User, message: AcceptMessage): Promise<AcceptMessage> => {
  const call = await calls.getById(message.payload.id);

  if (!call) {
    throw new CallNotFoundException();
  }

  const helper = new TwilioHelper(await user.getAccount());

  await helper.addUserToConference(call);

  return new AcceptMessage(message.payload.id, message.header.id);
};

export const AcceptMessageHandler = {
  handle,
};
