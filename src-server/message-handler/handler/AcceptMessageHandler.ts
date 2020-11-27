import { callRepository as calls } from '../../worker';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { AcceptMessage } from '../../models/socket/messages/AcceptMessage';
import { UserWithSocket } from '../../models/UserWithSocket';

const handle = async (user: UserWithSocket, message: AcceptMessage): Promise<AcceptMessage> => {
  const call = await calls.getById(message.payload.id);

  if (!call) {
    throw new CallNotFoundException();
  }

  const helper = new TwilioHelper(user.account);

  await helper.addUserToConference(call);

  return new AcceptMessage(message.payload.id, message.header.id);
};

export const AcceptMessageHandler = {
  handle,
};
