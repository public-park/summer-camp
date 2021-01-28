import { PhoneConfigurationDocument } from '../../documents/PhoneConfigurationDocument';
import { Message, MessageType } from './Message';

export class ConfigurationMessage extends Message {
  payload: PhoneConfigurationDocument | undefined;

  constructor(configuration: PhoneConfigurationDocument | undefined, messageId?: string) {
    super(MessageType.Configuration, messageId);

    this.payload = configuration;
  }
}
