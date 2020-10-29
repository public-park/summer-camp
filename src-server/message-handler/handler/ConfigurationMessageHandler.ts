import { ConfigurationMessage } from '../../models/socket/messages/ConfigurationMessage';
import { Message } from '../../models/socket/messages/Message';
import { UserWithSocket } from '../../models/UserWithSocket';

const handle = async (user: UserWithSocket, message: Message): Promise<ConfigurationMessage> => {
  return new ConfigurationMessage(user.getConfiguration(), message.header.id);
};

export const ConfigurationMessageHandler = {
  handle,
};
