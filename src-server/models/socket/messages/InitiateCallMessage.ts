import { MessageType, Message } from './Message';

export class InitiateCallMessage extends Message {
  payload: {
    to: string;
  };

  constructor(to: string, messageId?: string) {
    super(MessageType.InitiateCall, messageId);

    this.payload = {
      to: to,
    };
  }
}
