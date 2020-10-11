import { Message, MessageType } from './Message';

export class AcceptMessage extends Message {
  payload: {
    id: string;
  };

  constructor(id: string, messageId?: string) {
    super(MessageType.Accept, messageId);

    this.payload = {
      id: id,
    };
  }
}
