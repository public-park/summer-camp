import { CallStatus, CallDirection } from '../../../phone/Call';
import { Message } from './Message';

export interface CallMessage extends Message {
  payload: {
    id: string;
    from: string;
    to: string;
    status: CallStatus;
    direction: CallDirection;
  };
}
