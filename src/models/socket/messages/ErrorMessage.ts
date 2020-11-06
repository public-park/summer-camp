import { Message, MessageType } from './Message';

export class ErrorMessage extends Message {
  payload: string;

  constructor(text: string, messageId?: string) {
    super(MessageType.Error, messageId);

    this.payload = text;
  }
}
