import { UserConfiguration } from '../../UserConfiguration';
import { Message } from './Message';

export interface ConfigurationMessage extends Message {
  payload: UserConfiguration | undefined;
}
