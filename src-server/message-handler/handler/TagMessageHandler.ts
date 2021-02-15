import { TagMessage } from '../../models/socket/messages/TagMessage';
import { User } from '../../models/User';
import { userRepository as users } from '../../worker';

const handle = async (user: User, message: TagMessage): Promise<TagMessage> => {
  user.tags = new Set(message.payload.tags);

  await users.save(user);

  return new TagMessage(user.tags, message.header.id);
};

export const TagMessageHandler = {
  handle,
};
