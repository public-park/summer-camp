import * as WebSocket from 'ws';
import { UserWithOnlineState } from './pool/UserWithOnlineState';

export interface WebSocketWithKeepAlive extends WebSocket {
  isAlive: boolean;
  token: string;
  user: UserWithOnlineState;
  remoteAddress: string | undefined;
}
