import { MessageType } from '../../models/socket/messages/Message';
import { TagMessage } from '../../models/socket/messages/TagMessage';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';

const handle = async (user: UserWithOnlineState, message: TagMessage): Promise<TagMessage> => {
  user.tags = new Set(message.payload.tags);

  await user.persist();

  return new TagMessage(user.tags, message.header.id);
};

export const TagMessageHandler = {
  handle,
};
