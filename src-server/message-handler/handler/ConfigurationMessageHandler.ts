import { ConfigurationMessage } from '../../models/socket/messages/ConfigurationMessage';
import { Message } from '../../models/socket/messages/Message';
import { UserWithOnlineState } from '../../pool/UserWithOnlineState';

const handle = async (user: UserWithOnlineState, message: Message): Promise<ConfigurationMessage> => {
  return new ConfigurationMessage(user.getConfiguration(), message.header.id);
};

export const ConfigurationMessageHandler = {
  handle,
};
