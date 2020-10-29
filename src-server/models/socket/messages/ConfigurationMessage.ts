import { UserConfiguration } from '../../UserConfiguration';
import { Message, MessageType } from './Message';

export class ConfigurationMessage extends Message {
  payload: UserConfiguration | undefined;

  constructor(configuration: UserConfiguration | undefined, messageId?: string) {
    super(MessageType.Configuration, messageId);

    this.payload = configuration;
  }
}
