import { Message, MessageType } from './Message';

export class AcknowledgeMessage extends Message {
  payload: undefined;

  constructor(messageId: string) {
    super(MessageType.Acknowledge, messageId);

    this.payload = undefined;
  }
}
