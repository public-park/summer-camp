import * as http from 'http';
import { TokenHelper } from './helpers/TokenHelper';
import * as WebSocket from 'ws';
import { WebSocketWithKeepAlive } from './WebSocketWithKeepAlive';
import { log } from './logger';
import { UserPoolManager } from './pool/UserPoolManager';
import { accountRepository } from './worker';
import { AccountNotFoundException } from './exceptions/AccountNotFoundException';
import { InvalidHttpHeaderException } from './exceptions/InvalidHttpHeaderException';

import { CloseCode } from './models/socket/CloseCode';
import { MessageParser } from './message-handler/MessageParser';
import { Message, MessageType } from './models/socket/messages/Message';
import { ActivityMessageHandler } from './message-handler/handler/ActivityMessageHandler';
import { InitiateCallMessageHandler } from './message-handler/handler/InitiateCallMessageHandler';
import { HoldMessageHandler } from './message-handler/handler/HoldMessageHandler';
import { AcceptMessageHandler } from './message-handler/handler/AcceptMessageHandler';
import { RecordMessageHandler } from './message-handler/handler/RecordMessageHandler';

import { ConfigurationMessageHandler } from './message-handler/handler/ConfigurationMessageHandler';
import { InvalidMessageException } from './exceptions/InvalidMessageException';
import { TagMessageHandler } from './message-handler/handler/TagMessageHandler';
import { ErrorMessage } from './models/socket/messages/ErrorMessage';
import { InitiateCallMessage } from './models/socket/messages/InitiateCallMessage';
import { AcknowledgeMessageHandler } from './message-handler/AcknowledgeMessageHandler';
import { ConnectMessage } from './models/socket/messages/ConnectMessage';
import { UserNotFoundException } from './exceptions/UserNotFoundException';
import { RejectMessageHandler } from './message-handler/handler/RejectMessageHandler';
import { User } from './models/User';

export interface SocketWorkerOptions {
  server: WebSocket.ServerOptions;
  keepAliveInSeconds: number;
}

export class SocketWorker {
  options: SocketWorkerOptions;
  pool: UserPoolManager;
  acknowledge: AcknowledgeMessageHandler;

  server: WebSocket.Server | undefined;
  keepAliveInterval: NodeJS.Timeout | undefined;

  constructor(options: SocketWorkerOptions, pool: UserPoolManager) {
    this.pool = pool;
    this.options = options;
    this.server = undefined;
    this.keepAliveInterval = undefined;
    this.acknowledge = new AcknowledgeMessageHandler();
  }

  async getUserFromHttpHeader(headers: http.IncomingHttpHeaders): Promise<User> {
    if (!headers.userId || !headers.accountId || !headers.token) {
      throw new InvalidHttpHeaderException();
    }

    const account = await accountRepository.getById(<string>headers.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    const user = await this.pool.getByIdWithFallback(<string>headers.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

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

        log.info(`add user ${user.id}, (socket(s) ${user.sockets.length()}) to pool, size is ${this.pool.getSize()}`);

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

        socket.on('message', async (data: WebSocket.Data) => {
          log.debug(`received message: ${data.toString()}`);

          try {
            const message = MessageParser.validate(MessageParser.parse(data));

            let response: Message | undefined;

            // TODO response = SocketManager.handleMessage(this.pool, user, message)
            //            SocketManager.handleClose(this.pool, socket)

            switch (message.header.type) {
              case MessageType.Activity:
                response = await ActivityMessageHandler.handle(this.pool, user, message);
                break;

              case MessageType.Tags:
                response = await TagMessageHandler.handle(user, message);
                break;

              case MessageType.InitiateCall:
                response = await InitiateCallMessageHandler.handle(
                  user,
                  message as InitiateCallMessage,
                  this.acknowledge
                );
                break;

              case MessageType.Configuration:
                response = await ConfigurationMessageHandler.handle(user, message);
                break;

              case MessageType.Hold:
                response = await HoldMessageHandler.handle(user, message);
                break;

              case MessageType.Accept:
                response = await AcceptMessageHandler.handle(user, message);
                break;

              case MessageType.Reject:
                response = await RejectMessageHandler.handle(user, message);
                break;

              case MessageType.Record:
                response = await RecordMessageHandler.handle(user, message);
                break;

              case MessageType.Acknowledge:
                this.acknowledge.handle(message);
                break;

              default:
                throw new InvalidMessageException(`Invalid type ${message.header.type} received`);
            }

            if (response) {
              socket.send(response.toString());
            }
          } catch (error) {
            log.error(error);

            socket.send(new ErrorMessage(`${error.name} : ${error.description}`).toString());
          }
        });

        socket.on('close', (code: number, reason: string) => {
          user.sockets.remove(socket);

          if (user.sockets.length() === 0) {
            this.pool.delete(user);
          }

          log.debug(`${user.id} closed socket with code ${code}, message: ${reason}, socket(s) ${user.sockets}`);
        });

        /* close existing sockets */
        user.sockets.close(CloseCode.ConcurrentSession);

        user.sockets.add(socket);

        this.pool.add(user);

        user.broadcast(await new ConnectMessage().build(this.pool, user));
      } catch (error) {
        log.error(error);
        socket.terminate();
      }
    });

    this.startKeepAlive();
  }
  // TODO run keepalive on socket manager, and use pool
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

  ping(socket: WebSocketWithKeepAlive) {
    if (!socket.isAlive) {
      log.debug(`${socket.user.id} socket ${socket.remoteAddress} terminated, no pong received`);
      socket.terminate();
    }

    try {
      TokenHelper.verifyJwt((socket as WebSocketWithKeepAlive).token);
    } catch (error) {
      log.debug(`${socket.user.id} remote ${socket.remoteAddress} - ${error.name}`);
      socket.close(CloseCode.TokenExpired);
    }

    socket.isAlive = false;
    socket.ping();
  }
}
