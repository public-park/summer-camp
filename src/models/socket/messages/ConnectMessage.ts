import { PhoneConfigurationDocument } from '../../documents/PhoneConfigurationDocument';
import { UserPresenceDocument } from '../../documents/UserDocument';
import { Message } from './Message';

export interface ConnectMessage extends Message {
  payload: {
    user: UserPresenceDocument;
    phone: PhoneConfigurationDocument;
    users: Array<UserPresenceDocument>;
  };
}
