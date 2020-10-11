import { Message, MessageType } from './Message';

export class TagMessage extends Message {
  payload: {
    tags: string[];
  };

  constructor(tags: Set<string>, messageId?: string) {
    super(MessageType.Tags, messageId);

    this.payload = {
      tags: Array.from(tags.values()),
    };
  }
}
