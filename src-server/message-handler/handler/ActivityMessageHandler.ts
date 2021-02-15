import { ActivityMessage } from '../../models/socket/messages/ActivityMessage';
import { User } from '../../models/User';
import { UserPoolManager } from '../../pool/UserPoolManager';
import { userRepository as users } from '../../worker';

const handle = async (pool: UserPoolManager, user: User, message: ActivityMessage): Promise<ActivityMessage> => {
  user.activity = message.payload.activity;

  await users.save(user);

  pool.broadcastToAccount(user);

  return new ActivityMessage(user.activity, message.header.id);
};

export const ActivityMessageHandler = {
  handle,
};
