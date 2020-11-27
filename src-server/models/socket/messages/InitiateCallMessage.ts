import { MessageType, Message } from './Message';

export class InitiateCallMessage extends Message {
  payload: {
    to: string;
    from?: string;
  };

  constructor(to: string, from?: string, messageId?: string) {
    super(MessageType.InitiateCall, messageId);

    this.payload = {
      to: to,
      from: from,
    };
  }
}
