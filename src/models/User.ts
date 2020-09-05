import { EventEmitter } from 'events';
import { UserActivity } from './enums/UserActivity';
import { UserConnectionState } from './enums/UserConnectionState';
import { WebSocketNotInStateOpenException } from '../exceptions/WebSocketNotInStateOpenException';
import { UserRole } from './enums/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { UserEvent } from './enums/UserEvent';
import { UserMessage } from './UserMessage';

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

  connection: {
    socket: WebSocket | undefined;
    state: UserConnectionState;
    url: string | undefined;
  };
  sockets: number | undefined;
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

    this.connection.socket.onmessage = (message: MessageEvent) => {
      console.log('message received: ' + message.data);

      try {
        const payload = JSON.parse(message.data);
        console.log(payload);
        console.log(UserEvent.Call in payload);
        if (UserEvent.Activity in payload) {
          this._setActivity(payload.activity);
        }

        if (UserEvent.User in payload) {
          this.id = payload.user.id;
          this.name = payload.user.name;
          this.profileImageUrl = payload.user.profileImageUrl;
          this.accountId = payload.user.accountId;
          this._tags = new Set(payload.user.tags);
          this.role = payload.user.role;
          this.sockets = payload.user.sockets;

          this._setActivity(payload.user.activity);
          this._setConnectionState(UserConnectionState.Open);
        }

        if (UserEvent.Configuration in payload) {
          this.eventEmitter.emit(UserEvent.Configuration, payload.configuration);
        }

        if (UserEvent.Call in payload) {
          this.eventEmitter.emit(UserEvent.Call, payload.call);
        }

        this.eventEmitter.emit(payload.id, payload);
      } catch (error) {
        this.eventEmitter.emit('error', error);
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

  send(type: UserEvent, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connection.socket || this.connection.socket.readyState !== WebSocket.OPEN) {
        throw new WebSocketNotInStateOpenException();
      }

      const message: UserMessage = {
        id: uuidv4(),
        payload: {
          [type]: payload,
        },
      };

      this.eventEmitter.once(message.id, (payload: any) => {
        resolve(payload);
      });

      this.connection.socket.send(JSON.stringify(message));
    });
  }

  set activity(activity: UserActivity) {
    this.send(UserEvent.Activity, activity);
  }

  get activity(): UserActivity {
    return this._activity;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  set tags(tags: Set<string>) {
    this.send(UserEvent.Tags, tags.values());
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

  onConfigurationChanged(listener: (configuration: any) => void) {
    this.eventEmitter.on('configuration', listener);
  }

  onConnectionError(listener: (event: Event) => void) {
    this.eventEmitter.on('connection_error', listener);
  }

  onError(listener: (error: Error) => void) {
    this.eventEmitter.on('error', listener);
  }

  on(event: UserEvent, listener: (payload: any) => void) {
    this.eventEmitter.on(event, listener);
  }

  off(event: UserEvent, listener: (payload: any) => void) {
    this.eventEmitter.off(event, listener);
  }
}
