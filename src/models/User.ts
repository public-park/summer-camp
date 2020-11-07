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

enum UserEventType {
  Activity = 'usera_ctivity',
  ConnectionState = 'user_connection_state',
  ConnectionError = 'user_connection_error',
}

export class User {
  id: string | undefined;
  token: string | undefined;
  name: string | undefined;
  profileImageUrl: string | undefined;
  accountId: string | undefined;
  tags: Set<string>;
  activity: UserActivity;
  role: UserRole | undefined;
  configuration: UserConfiguration | undefined;

  connection: {
    // TODO crate separate Connection model
    socket: WebSocket | undefined;
    state: UserConnectionState;
    url: string | undefined;
    sockets: number | undefined;
  };

  private events: EventEmitter;

  constructor() {
    this.events = new EventEmitter();

    this.id = undefined;
    this.name = undefined;
    this.profileImageUrl = undefined;
    this.token = undefined;
    this.accountId = undefined;
    this.tags = new Set();
    this.activity = UserActivity.Unknown;
    this.role = undefined;
    this.connection = {
      socket: undefined,
      state: UserConnectionState.Closed,
      url: undefined,
      sockets: 0,
    };
  }

  private setConnectionState(state: UserConnectionState, ...args: any) {
    if (this.connection.state === state) {
      console.log(`ignore connection state ${state}`);
      return;
    }

    console.log(`set connection state to: ${state}`);
    this.connection.state = state;

    this.events.emit(UserEventType.ConnectionState, state, ...args);
  }

  login(url: string, token: string) {
    this.setConnectionState(UserConnectionState.Connecting);

    this.token = token;
    this.connection.url = url;

    this.connection.socket = new WebSocket(`${url}?t=${token}`);

    this.connection.socket.onerror = (event: Event) => {
      this.events.emit(UserEventType.ConnectionError, event);
    };

    this.connection.socket.onopen = (event: Event) => {
      console.log('socket is open');
    };

    this.connection.socket.onmessage = (event: MessageEvent) => {
      console.info(`message received: ${event.data}`);

      try {
        const message: Message = JSON.parse(event.data);

        if (message.header.type === MessageType.Connect) {
          const { payload } = message as ConnectMessage;

          this.id = payload.user.id;
          this.name = payload.user.name;
          this.profileImageUrl = payload.user.profileImageUrl;
          this.accountId = payload.user.accountId;
          this.tags = new Set(payload.user.tags);
          this.role = payload.user.role;
          this.activity = payload.user.activity;
          this.configuration = payload.configuration;

          this.events.emit(UserEventType.Activity, this.activity);

          this.setConnectionState(UserConnectionState.Open);
        }

        if (message.header.type === MessageType.Activity) {
          this.activity = message.payload.activity;
        }

        if (message.header.type === MessageType.Tags) {
          this.tags = new Set(message.payload.tags);
        }

        this.send(new AcknowledgeMessage(message.header.id));

        this.events.emit(message.header.id, message);
        this.events.emit(message.header.type, message);
      } catch (error) {
        console.error(error);
        this.events.emit(MessageType.Error, new InvalidMessageException());
      }
    };

    this.connection.socket.onclose = (event: CloseEvent) => {
      console.log(`socket closed with code ${event.code} reason ${event.reason}`);

      if (event.code === 4001) {
        this.setConnectionState(UserConnectionState.Expired, event.code);
      } else {
        this.setConnectionState(UserConnectionState.Closed, event.code);
      }
    };
  }

  logout(): Promise<void> {
    this.events.removeAllListeners(UserEventType.ConnectionState);

    return new Promise((resolve, reject) => {
      const onConnectionStateClosed = (state: UserConnectionState) => {
        if (state === UserConnectionState.Closed) {
          resolve();

          this.events.off(UserEventType.ConnectionState, onConnectionStateClosed);
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

      this.events.once(message.header.id, (payload: U) => {
        resolve(payload);
      });

      this.connection.socket.send(message.toString());

      console.info(`message sent: ${message.toString()}`);
    });
  }

  isAvailable() {
    return this.activity === UserActivity.WaitingForWork;
  }

  isConnected() {
    return this.connection.state === UserConnectionState.Open;
  }

  async setTags(tags: Set<string>) {
    await this.send(new TagMessage(tags));

    this.tags = tags;
  }

  async setActivity(activity: UserActivity) {
    console.info(`set state to: ${activity}`);

    await this.send(new ActivityMessage(activity));

    this.activity = activity;

    this.events.emit(UserEventType.Activity, activity);
  }

  onActivityChanged(listener: (activity: UserActivity) => void) {
    this.events.on(UserEventType.Activity, listener);
  }

  onConnectionStateChanged(listener: (state: UserConnectionState, code: number | undefined) => void) {
    this.events.on(UserEventType.ConnectionState, listener);
  }

  onReady(listener: () => void) {
    this.events.on(MessageType.Connect, listener);
  }

  onConnectionError(listener: (event: Event) => void) {
    this.events.on(UserEventType.ConnectionError, listener);
  }

  on<T extends Message>(event: MessageType, listener: (message: T) => void) {
    this.events.on(event, listener);
  }

  off<T extends Message>(event: MessageType, listener: (message: T) => void) {
    this.events.off(event, listener);
  }
}
