import { ActivityMessage } from '../../models/socket/messages/ActivityMessage';
import { UserPool } from '../../pool/UserPool';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';

const handle = async (
  pool: UserPool,
  user: UserWithOnlineState,
  message: ActivityMessage
): Promise<ActivityMessage> => {
  user.activity = message.payload.activity;

  await user.persist();

  pool.broadcastToAll(user);

  return new ActivityMessage(user.activity, message.header.id);
};

export const ActivityMessageHandler = {
  handle,
};
