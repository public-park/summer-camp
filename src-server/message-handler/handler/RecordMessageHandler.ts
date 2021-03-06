import { callRepository as calls } from '../../worker';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { TwilioCallControlHelper } from '../../helpers/twilio/TwilioCallControlHelper';
import { CallNotInProgressException } from '../../exceptions/CallNotInProgressException';
import { CallStatus } from '../../models/CallStatus';
import { RecordMessage } from '../../models/socket/messages/RecordMessage';
import { User } from '../../models/User';

const handle = async (user: User, message: RecordMessage): Promise<RecordMessage> => {
  const call = await calls.getById(message.payload.id);

  if (!call) {
    throw new CallNotFoundException();
  }

  if (call.status !== CallStatus.InProgress) {
    throw new CallNotInProgressException();
  }

  const helper = new TwilioCallControlHelper(await user.getAccount());

  await helper.record(call, message.payload.state);

  return new RecordMessage(call.id, message.payload.state, message.header.id);
};

export const RecordMessageHandler = {
  handle,
};
