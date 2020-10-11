import { UserResponse } from '../../User';
import { Message, MessageType } from './Message';

export class UserMessage extends Message {
  payload: UserResponse;

  constructor(user: UserResponse, messageId?: string) {
    super(MessageType.User, messageId);

    this.payload = user;
  }
}
