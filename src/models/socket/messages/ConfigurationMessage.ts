import { PhoneConfigurationDocument } from '../../documents/PhoneConfigurationDocument';
import { Message } from './Message';

export interface ConfigurationMessage extends Message {
  payload: PhoneConfigurationDocument | undefined;
}
