import { AccountConfiguration } from '../../AccountConfiguration';
import { UserConfiguration } from '../../User';
import { Message } from './Message';

export interface ConfigurationMessage extends Message {
  payload: UserConfiguration | null;
}
