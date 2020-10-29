import { TagMessage } from '../../models/socket/messages/TagMessage';
import { UserWithSocket } from '../../models/UserWithSocket';

const handle = async (user: UserWithSocket, message: TagMessage): Promise<TagMessage> => {
  user.tags = new Set(message.payload.tags);

  await user.persist();

  return new TagMessage(user.tags, message.header.id);
};

export const TagMessageHandler = {
  handle,
};
