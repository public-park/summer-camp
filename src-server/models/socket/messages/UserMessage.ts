import { UserPresenceDocument } from '../../documents/UserDocument';
import { User } from '../../User';
import { Message, MessageType } from './Message';

export class UserMessage extends Message {
  payload: Array<UserPresenceDocument>;

  constructor(user: User, messageId?: string) {
    super(MessageType.User, messageId);

    this.payload = [user.toPresenceDocument()];
  }
}
