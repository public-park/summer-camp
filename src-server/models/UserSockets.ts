import { WebSocketWithKeepAlive } from '../WebSocketWithKeepAlive';

export class UserSockets {
  private sockets: Array<WebSocketWithKeepAlive>;

  constructor(sockets: Array<WebSocketWithKeepAlive> = []) {
    this.sockets = sockets;
  }

  add(socket: WebSocketWithKeepAlive) {
    this.sockets.push(socket);
  }

  remove(socket: WebSocketWithKeepAlive) {
    this.sockets = this.sockets.filter((s) => s !== socket);
  }

  broadcast(payload: string) {
    this.sockets.forEach((sockets) => {
      sockets.send(payload);
    });
  }

  close(code: number) {
    this.sockets.forEach((sockets) => {
      sockets.close(code);
    });

    this.sockets = [];
  }

  get() {
    return this.sockets;
  }

  length() {
    return this.sockets.length;
  }
}
