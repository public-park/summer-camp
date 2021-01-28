import { UserPresenceDocument } from '../../documents/UserDocument';
import { Message } from './Message';

export interface UserMessage extends Message {
  payload: Array<UserPresenceDocument>;
}
