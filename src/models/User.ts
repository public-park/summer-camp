import { EventEmitter } from 'events';
import { UserActivity } from './UserActivity';
import { UserConnectionState } from './UserConnectionState';
import { WebSocketNotInStateOpenException } from '../exceptions/WebSocketNotInStateOpenException';
import { UserRole } from './UserRole';
import { Message, MessageType } from './socket/messages/Message';
import { ActivityMessage } from './socket/messages/ActivityMessage';
import { TagMessage } from './socket/messages/TagMessage';
import { InvalidMessageException } from '../exceptions/InvalidMessageException';
import { AcknowledgeMessage } from './socket/messages/AcknowledgeMessage';
import { ConnectMessage } from './socket/messages/ConnectMessage';
import { UserConfiguration } from './UserConfiguration';

export class User {
  id: string | undefined;
  token: string | undefined;
  name: string | undefined;
  profileImageUrl: string | undefined;
  accountId: string | undefined;
  private _tags: Set<string>;
  private _isAvailable: boolean;
  private _activity: UserActivity;
  role: UserRole | undefined;
  configuration: UserConfiguration | undefined;

  connection: {
    // TODO crate separate Connection model
    socket: WebSocket | undefined;
    state: UserConnectionState;
    url: string | undefined;
    sockets: number | undefined;
  };

  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();

    this.id = undefined;
    this.name = undefined;
    this.profileImageUrl = undefined;
    this.token = undefined;
    this.accountId = undefined;
    this._tags = new Set();
    this._isAvailable = false;
    this._activity = UserActivity.Unknown;
    this.role = undefined;
    this.connection = {
      socket: undefined,
      state: UserConnectionState.Closed,
      url: undefined,
      sockets: 0,
    };
  }

  private _setActivity(activity: UserActivity) {
    this._activity = activity;

    this._isAvailable = activity === UserActivity.WaitingForWork ? true : false;

    this.eventEmitter.emit('activity', activity);
  }

  private _setConnectionState(state: UserConnectionState, ...args: any) {
    if (this.connection.state === state) {
      console.log(`ignore connection state ${state}`);
      return;
    }

    console.log(`set connection state to: ${state}`);
    this.connection.state = state;

    this.eventEmitter.emit('connection_state', state, ...args);
  }

  login(url: string, token: string) {
    this._setConnectionState(UserConnectionState.Connecting);

    this.token = token;
    this.connection.url = url;

    this.connection.socket = new WebSocket(`${url}?t=${token}`);

    this.connection.socket.onerror = (event: Event) => {
      this.eventEmitter.emit('connection_error', event);
    };

    this.connection.socket.onopen = (event: Event) => {
      console.log('socket is open');
    };

    this.connection.socket.onmessage = (event: MessageEvent) => {
      console.log('message received: ' + event.data);

      try {
        const message: Message = JSON.parse(event.data);

        switch (message.header.type) {
          case MessageType.Connect:
            const { payload } = message as ConnectMessage;

            this.id = payload.user.id;
            this.name = payload.user.name;
            this.profileImageUrl = payload.user.profileImageUrl;
            this.accountId = payload.user.accountId;
            this._tags = new Set(payload.user.tags);
            this.role = payload.user.role;

            this._setActivity(payload.user.activity);
            this._setConnectionState(UserConnectionState.Open);

            this.configuration = payload.configuration;

            this.eventEmitter.emit(MessageType.Connect, message);
            break;

          case MessageType.Activity:
            this._setActivity(message.payload.activity);
            break;

          case MessageType.Configuration:
            this.eventEmitter.emit(MessageType.Configuration, message);
            break;

          case MessageType.Call:
            this.eventEmitter.emit(MessageType.Call, message);
            break;

          case MessageType.Error:
            this.eventEmitter.emit(MessageType.Error, message);
            break;

          case MessageType.User:
            this.eventEmitter.emit(MessageType.User, message);
            break;
        }

        this.send(new AcknowledgeMessage(message.header.id));

        this.eventEmitter.emit(message.header.id, message);
      } catch (error) {
        console.log(error);
        this.eventEmitter.emit(MessageType.Error, new InvalidMessageException());
      }
    };

    this.connection.socket.onclose = (event: CloseEvent) => {
      console.log(`socket closed with code ${event.code} reason ${event.reason}`);

      if (event.code === 4001) {
        this._setConnectionState(UserConnectionState.Expired, event.code);
      } else {
        this._setConnectionState(UserConnectionState.Closed, event.code);
      }
    };
  }

  logout(): Promise<void> {
    this.eventEmitter.removeAllListeners('connection_state');

    return new Promise((resolve, reject) => {
      const onConnectionStateClosed = (state: UserConnectionState) => {
        if (state === UserConnectionState.Closed) {
          resolve();

          this.eventEmitter.off('connection_state', onConnectionStateClosed);
        }
      };

      if (
        this.connection.socket &&
        (this.connection.state === UserConnectionState.Open || this.connection.state === UserConnectionState.Connecting)
      ) {
        this.onConnectionStateChanged(onConnectionStateClosed);

        this.connection.socket.close();
      } else {
        return resolve();
      }
    });
  }

  send<T extends Message, U>(message: T): Promise<U> {
    return new Promise((resolve, reject) => {
      if (!this.connection.socket || this.connection.socket.readyState !== WebSocket.OPEN) {
        throw new WebSocketNotInStateOpenException();
      }

      this.eventEmitter.once(message.header.id, (payload: U) => {
        resolve(payload);
      });

      this.connection.socket.send(message.toString());
    });
  }

  set activity(activity: UserActivity) {
    this.send(new ActivityMessage(activity));
  }

  get activity(): UserActivity {
    return this._activity;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  isConnected() {
    return this.connection.state === UserConnectionState.Open;
  }

  set tags(tags: Set<string>) {
    this.send(new TagMessage(tags));
  }

  get tags(): Set<string> {
    return this._tags;
  }

  onActivityChanged(listener: (activity: UserActivity) => void) {
    this.eventEmitter.on('activity', listener);
  }

  onConnectionStateChanged(listener: (state: UserConnectionState, code: number | undefined) => void) {
    this.eventEmitter.on('connection_state', listener);
  }

  onReady(listener: () => void) {
    this.eventEmitter.on(MessageType.Connect, listener);
  }

  onConnectionError(listener: (event: Event) => void) {
    this.eventEmitter.on('connection_error', listener);
  }

  onError(listener: (text: string) => void) {
    this.eventEmitter.on('error', listener);
  }

  on<T extends Message>(event: MessageType, listener: (message: T) => void) {
    this.eventEmitter.on(event, listener);
  }

  off<T extends Message>(event: MessageType, listener: (message: T) => void) {
    this.eventEmitter.off(event, listener);
  }
}
