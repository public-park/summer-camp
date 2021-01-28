import { UserPresenceDocument } from '../../documents/UserDocument';
import { UserWithSocket } from '../../UserWithSocket';
import { Message, MessageType } from './Message';

export class UserMessage extends Message {
  payload: Array<UserPresenceDocument>;

  constructor(user: UserWithSocket, messageId?: string) {
    super(MessageType.User, messageId);

    this.payload = [user.toPresenceDocument()];
  }
}
