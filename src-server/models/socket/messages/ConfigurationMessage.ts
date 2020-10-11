import { AccountConfiguration } from '../../AccountConfiguration';
import { UserConfiguration } from '../../User';
import { Message, MessageType } from './Message';

export class ConfigurationMessage extends Message {
  payload: UserConfiguration | null;

  constructor(configuration: UserConfiguration | null, messageId?: string) {
    super(MessageType.Configuration, messageId);

    this.payload = configuration;
  }
}
