import { UserWithPresenceDocument } from '../../documents/UserDocument';
import { UserConfiguration } from '../../UserConfiguration';
import { Message, MessageType } from './Message';

export interface ConnectMessage extends Message {
  payload: {
    user: UserWithPresenceDocument;
    configuration: UserConfiguration;
    list: Array<UserWithPresenceDocument>;
  };
}
