import { EventEmitter } from 'events';
import { WebSocketNotInStateOpenException } from '../exceptions/WebSocketNotInStateOpenException';
import { Message, MessageType } from './socket/messages/Message';
import { InvalidMessageException } from '../exceptions/InvalidMessageException';
import { AcknowledgeMessage } from './socket/messages/AcknowledgeMessage';

enum ConnectionEventType {
  State = 'user_connection_state',
  Error = 'user_connection_error',
}

export enum ConnectionState {
  Open = 'open',
  Connecting = 'connecting',
  Closed = 'closed',
  Expired = 'expired',
}

export class Connection {
  token: string | undefined;
  socket: WebSocket | undefined;
  state: ConnectionState;
  url: string | undefined;

  private events: EventEmitter;

  constructor() {
    this.events = new EventEmitter();

    this.state = ConnectionState.Closed;
  }

  private setState(state: ConnectionState, ...args: any) {
    if (this.state === state) {
      console.log(`ignore connection state ${state}`);
      return;
    }

    console.log(`set connection state to: ${state}`);
    this.state = state;

    this.events.emit(ConnectionEventType.State, state, ...args);
  }

  login(url: string, token: string) {
    this.setState(ConnectionState.Connecting);

    this.token = token;
    this.url = url;

    this.socket = new WebSocket(`${url}?t=${token}`);

    this.socket.onerror = (event: Event) => {
      this.events.emit(ConnectionEventType.Error, event);
    };

    this.socket.onopen = () => {
      console.info('socket is open');

      this.setState(ConnectionState.Open);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const message: Message = JSON.parse(event.data);

        console.log(`%c WebSocket message: ${message.header.type.toUpperCase()}`, 'color: #00a2ff');
        console.info(message);

        this.send(new AcknowledgeMessage(message.header.id));

        this.events.emit(message.header.id, message);
        this.events.emit(message.header.type, message);
      } catch (error) {
        console.error(error);
        this.events.emit(MessageType.Error, new InvalidMessageException());
      }
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log(`socket closed with code ${event.code} reason ${event.reason}`);

      if (event.code === 4001) {
        this.setState(ConnectionState.Expired, event.code);
      } else {
        this.setState(ConnectionState.Closed, event.code);
      }
    };
  }

  logout(): Promise<void> {
    this.events.removeAllListeners(ConnectionEventType.State);

    return new Promise((resolve) => {
      const onStateClosed = (state: ConnectionState) => {
        if (state === ConnectionState.Closed) {
          resolve();

          this.events.off(ConnectionEventType.State, onStateClosed);
        }
      };

      if (this.socket && (this.state === ConnectionState.Open || this.state === ConnectionState.Connecting)) {
        this.onStateChanged(onStateClosed);

        this.socket.close();
      } else {
        return resolve();
      }
    });
  }

  send<T extends Message, U>(message: T): Promise<U> {
    return new Promise((resolve) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new WebSocketNotInStateOpenException();
      }

      this.events.once(message.header.id, (payload: U) => {
        resolve(payload);
      });

      this.socket.send(message.toString());

      console.info(`message sent: ${message.toString()}`);
    });
  }

  onStateChanged(listener: (state: ConnectionState, code: number | undefined) => void) {
    this.events.on(ConnectionEventType.State, listener);
  }

  onError(listener: (event: Event) => void) {
    this.events.on(ConnectionEventType.Error, listener);
  }

  on<T extends Message>(event: MessageType, listener: (message: T) => void) {
    this.events.on(event, listener);
  }

  off<T extends Message>(event: MessageType, listener: (message: T) => void) {
    this.events.off(event, listener);
  }
}
