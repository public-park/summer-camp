import { ActivityMessage } from '../../models/socket/messages/ActivityMessage';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';

const handle = async (user: UserWithOnlineState, message: ActivityMessage): Promise<ActivityMessage> => {
  user.activity = message.payload.activity;

  await user.persist();

  return new ActivityMessage(user.activity, message.header.id);
};

export const ActivityMessageHandler = {
  handle,
};
