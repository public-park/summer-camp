import { Message, MessageType } from './Message';

export class HoldMessage extends Message {
  payload: {
    id: string;
    state: boolean;
  };

  constructor(id: string, state: boolean, messageId?: string) {
    super(MessageType.Hold, messageId);

    this.payload = {
      id: id,
      state: state,
    };
  }
}
