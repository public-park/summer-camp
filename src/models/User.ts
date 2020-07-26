import { EventEmitter } from 'events';
import { UserActivity } from './enums/UserActivity';
import { UserConnectionState } from './enums/UserConnectionState';
import { WebSocketNotInStateOpenException } from '../exceptions/WebSocketNotInStateOpenException';
import { UserRole } from './enums/UserRole';
import { v4 as uuidv4 } from 'uuid';

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

        if ('activity' in payload) {
          this._setActivity(payload.activity);
        }

        if ('user' in payload) {
          this.id = payload.user.id;
          this.name = payload.user.name;
          this.profileImageUrl = payload.user.profileImageUrl;
          this.accountId = payload.user.accountId;
          this._tags = new Set(payload.user.tags);
          this.role = payload.user.role;

          this._setActivity(payload.user.activity);
          this._setConnectionState(UserConnectionState.Open);
        }

        if ('id' in payload) {
          this.eventEmitter.emit(payload.id, payload);
        }
      } catch (error) {
        // TODO, publish
        console.log(error);
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

  send(type: string, payload: any, callback: (...args: any) => any) {
    if (!this.connection.socket || this.connection.socket.readyState !== WebSocket.OPEN) {
      throw new WebSocketNotInStateOpenException();
    }

    const message: any = {
      id: uuidv4(),
    };

    message[type] = payload;

    this.eventEmitter.once(message.id, callback);

    this.connection.socket.send(JSON.stringify(message));
  }

  set activity(activity: UserActivity) {
    if (!this.connection.socket || this.connection.socket.readyState !== WebSocket.OPEN) {
      throw new WebSocketNotInStateOpenException();
    }

    this.connection.socket.send(
      JSON.stringify({
        activity: activity,
      })
    );
  }

  get activity(): UserActivity {
    return this._activity;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  set tags(tags: Set<string>) {
    if (!this.connection.socket || this.connection.socket.readyState !== WebSocket.OPEN) {
      throw new WebSocketNotInStateOpenException();
    }

    this.connection.socket.send(
      JSON.stringify({
        tags: tags.values(),
      })
    );
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

  onConnectionError(listener: (event: Event) => void) {
    this.eventEmitter.on('connection_error', listener);
  }
}
