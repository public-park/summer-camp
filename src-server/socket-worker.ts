import * as http from 'http';
import { TokenHelper } from './helpers/TokenHelper';
import * as WebSocket from 'ws';
import { WebSocketWithKeepAlive } from './WebSocketWithKeepAlive';
import { log } from './logger';
import { UserPool } from './pool/UserPool';

export class SocketWorker {
  options: any;
  pool: UserPool;

  server: WebSocket.Server | undefined;
  keepAliveInterval: NodeJS.Timeout | undefined;

  constructor(options: WebSocket.ServerOptions, pool: UserPool) {
    this.pool = pool;
    this.options = options;
    this.server = undefined;
    this.keepAliveInterval = undefined;
  }

  run() {
    this.server = new WebSocket.Server(this.options, () => {
      // is not triggered in noServer mode
      log.info(`${this.constructor.name}: ready: ${Date.now()}`);
    });

    this.server.on('listening', () => {
      // is not triggered in noServer mode
      log.info(`${this.constructor.name}: listening: ${Date.now()}`);
    });

    this.server.on('connection', async (socket: WebSocketWithKeepAlive, req: http.IncomingMessage) => {
      //const context = this.context;

      if (!req.headers.id || !req.headers.token) {
        throw new Error('invalid http header provided');
      }

      try {
        // TODO, if user is already connected, disconnect existing sockets with reason
        const user = await this.pool.getUserById(<string>req.headers.id);

        if (!user) {
          throw Error('user is null');
        }

        user.isOnline = true;

        this.pool.users.set(user.id, user);

        log.info(`add user ${user.id} to pool, new size is ${this.pool.users.size}`);

        socket.isAlive = true;
        socket.token = <string>req.headers.token;
        socket.user = user;
        socket.remoteAddress = req.connection.remoteAddress;

        socket.on('error', (error: Error) => {
          log.error(error);
        });

        socket.on('pong', () => {
          log.debug(`${socket.user.id} socket ${socket.remoteAddress} pong`);
          socket.isAlive = true;
        });

        socket.on('message', (message: WebSocket.Data) => {
          log.debug(`received message: ${message.toString()}`);

          const payload: any = JSON.parse(message.toString());

          if ('activity' in payload) {
            socket.send(message.toString());

            user.activity = payload.activity;

            this.pool.repository.update(user);
          }
        });

        socket.on('close', (code: number, reason: string) => {
          this.pool.users.delete(user.id);

          log.debug(`${user.id} closed socket with code ${code}, message: ${reason}`);
        });

        socket.send(JSON.stringify({ user: user.toApiResponse() }));
      } catch (error) {
        socket.terminate();
        log.debug(error);
      }
    });

    this.startKeepAlive();
  }

  startKeepAlive = () => {
    if (!this.server) {
      throw new Error('server does not exist');
    }

    this.keepAliveInterval = setInterval(() => {
      if (!this.server) {
        clearInterval(<NodeJS.Timeout>this.keepAliveInterval);
        throw new Error('server does not exist, stopped loop');
      }

      this.server.clients.forEach((socket: WebSocket) => {
        this.ping(socket as WebSocketWithKeepAlive);
      });

      log.info(`broadcast ping to ${this.server.clients.size} client(s)`);
    }, 30 * 1000);
  };

  closeSocketByUserId(id: string) {
    if (!this.server) {
      return;
    }

    this.server.clients.forEach((socket: WebSocketWithKeepAlive) => {
      if (socket.user.id === id) {
        socket.close();
      }
    });
  }

  ping(socket: WebSocketWithKeepAlive) {
    if (!socket.isAlive) {
      log.debug(`${socket.user.id} socket ${socket.remoteAddress} terminated, no pong received`);
      socket.terminate();
    }

    try {
      TokenHelper.verifyJwt((socket as WebSocketWithKeepAlive).token);
    } catch (error) {
      log.debug(`${socket.user.id} socket ${socket.remoteAddress} - ${error.name}`);
      socket.close(); // TODO, add reason
    }

    socket.isAlive = false;
    socket.ping();
  }
}
