import { ActivityMessage } from '../../models/socket/messages/ActivityMessage';
import { UserWithSocket } from '../../models/UserWithSocket';
import { UserPoolManager } from '../../pool/UserPoolManager';

const handle = async (
  pool: UserPoolManager,
  user: UserWithSocket,
  message: ActivityMessage
): Promise<ActivityMessage> => {
  user.activity = message.payload.activity;

  await user.persist();

  pool.broadcast(user);

  return new ActivityMessage(user.activity, message.header.id);
};

export const ActivityMessageHandler = {
  handle,
};
