import { callRepository as calls } from '../../worker';

import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { TwilioHelper } from '../../helpers/twilio/TwilioHelper';
import { CallNotInProgressException } from '../../exceptions/CallNotInProgressException';
import { CallStatus } from '../../models/CallStatus';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';
import { RecordMessage } from '../../models/socket/messages/RecordMessage';

const handle = async (user: UserWithOnlineState, message: RecordMessage): Promise<RecordMessage> => {
  const call = await calls.getById(message.payload.id);

  if (!call) {
    throw new CallNotFoundException();
  }

  if (call.status !== CallStatus.InProgress) {
    throw new CallNotInProgressException();
  }

  const helper = new TwilioHelper(user.account);

  await helper.setRecording(call, message.payload.state);

  return new RecordMessage(call.id, message.payload.state, message.header.id);
};

export const RecordMessageHandler = {
  handle,
};
