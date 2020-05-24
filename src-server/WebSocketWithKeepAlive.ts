import * as WebSocket from 'ws';
import { User } from './models/User';

export interface WebSocketWithKeepAlive extends WebSocket {
  isAlive: boolean;
  token: string;
  user: User;
  remoteAddress: string | undefined;
}
