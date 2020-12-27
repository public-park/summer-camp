import { Message, MessageType } from './Message';

export class RejectMessage extends Message {
  payload: {
    id: string;
  };

  constructor(id: string, messageId?: string) {
    super(MessageType.Reject, messageId);

    this.payload = {
      id: id,
    };
  }
}
