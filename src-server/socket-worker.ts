import * as http from 'http';
import { TokenHelper } from './helpers/TokenHelper';
import * as WebSocket from 'ws';
import { WebSocketWithKeepAlive } from './WebSocketWithKeepAlive';
import { log } from './logger';
import { UserPool } from './pool/UserPool';
import { ActivityCommandHandler } from './commands/ActivityCommandHandler';
import { CallCommandHandler } from './commands/CallCommandHandler';
import { HoldCommandHandler } from './commands/HoldCommandHandler';
import { accountRepository } from './worker';
import { AccountNotFoundException } from './exceptions/AccountNotFoundException';
import { UserWithOnlineState } from './pool/UserWithOnlineState';
import { InvalidHttpHeaderException } from './exceptions/InvalidHttpHeaderException';
import { TagsCommandHandler } from './commands/TagsCommandHandler';
import { PresenceCommandHandler } from './commands/PresenceCommandHandler';
import { ConfigurationCommandHandler } from './commands/ConfigurationCommandHandler';

interface SocketWorkerOptions {
  server: WebSocket.ServerOptions;
  keepAliveInSeconds: number;
}

export class SocketWorker {
  options: SocketWorkerOptions;
  pool: UserPool;

  server: WebSocket.Server | undefined;
  keepAliveInterval: NodeJS.Timeout | undefined;

  constructor(options: SocketWorkerOptions, pool: UserPool) {
    this.pool = pool;
    this.options = options;
    this.server = undefined;
    this.keepAliveInterval = undefined;
  }

  async getUserFromHttpHeader(headers: http.IncomingHttpHeaders): Promise<UserWithOnlineState> {
    if (!headers.userId || !headers.accountId || !headers.token) {
      throw new InvalidHttpHeaderException();
    }

    const account = await accountRepository.getById(<string>headers.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    const user = await this.pool.add(account, <string>headers.userId);

    return user;
  }

  run() {
    this.server = new WebSocket.Server(this.options.server, () => {
      // is not triggered in noServer mode
      log.info(`${this.constructor.name}: ready: ${Date.now()}`);
    });

    this.server.on('listening', () => {
      // is not triggered in noServer mode
      log.info(`${this.constructor.name}: listening: ${Date.now()}`);
    });

    this.server.on('connection', async (socket: WebSocketWithKeepAlive, req: http.IncomingMessage) => {
      try {
        const user = await this.getUserFromHttpHeader(req.headers);

        user.sockets.add(socket);

        log.info(`add user ${user.id}, (socket(s) ${user.sockets}) to pool, size is ${this.pool.users.size}`);

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

        socket.on('message', async (message: WebSocket.Data) => {
          log.debug(`received message: ${message.toString()}`);

          const payload: any = JSON.parse(message.toString());

          if ('activity' in payload) {
            const response = await ActivityCommandHandler.handle(user, payload.activity);

            socket.send(JSON.stringify(response));
          }

          if ('tags' in payload) {
            const response = await TagsCommandHandler.handle(user, payload.tags);

            socket.send(JSON.stringify(response));
          }

          if ('call' in payload) {
            const response = await CallCommandHandler.handle(user, payload.call.to);

            const message = {
              id: payload.id,
              call: {
                ...response,
              },
            };

            socket.send(JSON.stringify(message));
          }

          if ('presence' in payload) {
            const response = await PresenceCommandHandler.handle(user);

            const message = {
              id: payload.id,
              call: {
                ...response,
              },
            };

            socket.send(JSON.stringify(message));
          }

          if ('configuration' in payload) {
            const response = await ConfigurationCommandHandler.handle(user);

            const message = {
              id: payload.id,
              configuration: {
                ...response,
              },
            };

            socket.send(JSON.stringify(message));
          }

          if ('hold' in payload) {
            const response = await HoldCommandHandler.handle(user, payload.hold.id, payload.hold.state);

            const message = {
              id: payload.id,
              state: response,
            };

            socket.send(JSON.stringify(message));
          }
        });

        socket.on('close', (code: number, reason: string) => {
          user.sockets.remove(socket);

          if (user.sockets.length() === 0) {
            this.pool.delete(user.id);
          }

          log.debug(`${user.id} closed socket with code ${code}, message: ${reason}, socket(s) ${user.sockets}`);
        });

        // TODO, add code below to a handler
        user.broadcast({ user: user.toResponse() });
        user.broadcast({ configuration: user.getConfiguration() });
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
        throw new Error('server does not exist, stop keep alive');
      }

      this.server.clients.forEach((socket: WebSocket) => {
        this.ping(socket as WebSocketWithKeepAlive);
      });

      log.info(`broadcast ping to ${this.server.clients.size} client(s)`);
    }, this.options.keepAliveInSeconds * 1000);
  };

  closeSocketByUserId(id: string) {
    if (!this.server) {
      return;
    }

    this.pool.delete(id);

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
      log.debug(`${socket.user.id} remote ${socket.remoteAddress} - ${error.name}`);
      socket.close(4001);
    }

    socket.isAlive = false;
    socket.ping();
  }
}
