import { Call } from '../../Call';
import { CallDirection } from '../../CallDirection';
import { CallStatus } from '../../CallStatus';
import { Message, MessageType } from './Message';

export class CallMessage extends Message {
  payload: {
    id: string;
    from: string;
    to: string;
    status: CallStatus;
    direction: CallDirection;
  } | null;

  constructor(call: Call | undefined, messageId?: string) {
    super(MessageType.Call, messageId);

    if (call) {
      this.payload = {
        id: call.id,
        from: call.from,
        to: call.to,
        status: call.status,
        direction: call.direction,
      };
    } else {
      this.payload = null;
    }
  }
}
