import { CallDocument } from '../../documents/CallDocument';
import { Message } from './Message';

export interface CallMessage extends Message {
  payload: CallDocument;
}
