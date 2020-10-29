import * as WebSocket from 'ws';
import { UserWithSocket } from './models/UserWithSocket';

export interface WebSocketWithKeepAlive extends WebSocket {
  isAlive: boolean;
  token: string;
  user: UserWithSocket;
  remoteAddress: string | undefined;
}
