import { Call } from '../../Call';
import { CallStatusDocument } from '../../documents/CallDocument';
import { Message, MessageType } from './Message';

export class CallMessage extends Message {
  payload: CallStatusDocument | undefined;

  constructor(call: Call | undefined, messageId?: string) {
    super(MessageType.Call, messageId);

    this.payload = call?.toStatusDocument();
  }
}
