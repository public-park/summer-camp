import { Message, MessageType } from './Message';

export class TransferMessage extends Message {
  payload: {
    id: string;
    userId: string;
  };

  constructor(id: string, userId: string, messageId?: string) {
    super(MessageType.Transfer, messageId);

    this.payload = {
      id: id,
      userId: userId,
    };
  }
}
