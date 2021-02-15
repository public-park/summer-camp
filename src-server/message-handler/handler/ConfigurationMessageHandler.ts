import { ConfigurationMessage } from '../../models/socket/messages/ConfigurationMessage';
import { Message } from '../../models/socket/messages/Message';
import { User } from '../../models/User';

const handle = async (user: User, message: Message): Promise<ConfigurationMessage> => {
  const configuration = await user.getPhoneConfiguration();

  return new ConfigurationMessage(configuration, message.header.id);
};

export const ConfigurationMessageHandler = {
  handle,
};
