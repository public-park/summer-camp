import { Message, MessageType } from './Message';

export class RecordMessage extends Message {
  payload: {
    id: string;
    state: boolean;
  };

  constructor(id: string, state: boolean, messageId?: string) {
    super(MessageType.Record, messageId);

    this.payload = {
      id: id,
      state: state,
    };
  }
}
