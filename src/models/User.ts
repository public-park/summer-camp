import { EventEmitter } from 'events';
import { UserActivity } from './enums/UserActivity';
import { UserConnectionState } from './enums/UserConnectionState';
import { WebSocketNotInStateOpenException } from '../exceptions/WebSocketNotInStateOpenException';

export class User {
  id: string | undefined;
  token: string | undefined;
  name: string | undefined;
  profileImageUrl: string | undefined;
  accountId: string | undefined;
  private _labels: Set<string>;
  private _isAvailable: boolean;
  private _activity: UserActivity;
  connection: {
    socket: WebSocket | undefined;
    state: UserConnectionState;
  };
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();

    this.id = undefined;
    this.name = undefined;
    this.profileImageUrl = undefined;
    this.token = undefined;
    this.accountId = undefined;
    this._labels = new Set();
    this._isAvailable = false;
    this._activity = UserActivity.Unknown;
    this.connection = {
      socket: undefined,
      state: UserConnectionState.Closed,
    };
  }

  private _setActivity(activity: UserActivity) {
    this._activity = activity;

    this._isAvailable = activity === UserActivity.WaitingForWork ? true : false;

    this.eventEmitter.emit('activity', activity);
  }

  private _setConnectionState(state: UserConnectionState) {
    console.log('set connection state to:' + state);
    this.connection.state = state;

    this.eventEmitter.emit('connection_state', state);
  }

  login(url: string, token: string) {
    this._setConnectionState(UserConnectionState.Connecting);

    this.token = token;

    this.connection.socket = new WebSocket(`${url}?t=${token}`);

    this.connection.socket.onerror = (event: Event) => {
      console.log('socket has error');
      // TODO should delete token
      console.log(event);
    };

    this.connection.socket.onopen = (event: Event) => {
      console.log('socket is open');

      // TODO, this should be used as a success event?
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
          this._labels = new Set(payload.user.labels);

          this._setActivity(payload.user.activity);
          this._setConnectionState(UserConnectionState.Open);
        }
      } catch (error) {
        console.log(error);
      }
    };

    this.connection.socket.onclose = (event: Event) => {
      console.log('socket closed ');
      console.log(event); // TODO, publish reason to listener

      this._setConnectionState(UserConnectionState.Closed);
    };
  }

  logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const onConnectionStateClosed = (state: UserConnectionState) => {
        if (state === UserConnectionState.Closed) {
          resolve();

          this.eventEmitter.off('connection_state', onConnectionStateClosed);
        }
      };

      if (this.connection.socket && this.connection.state !== UserConnectionState.Closed) {
        this.onConnectionStateChanged(onConnectionStateClosed);

        this.connection.socket.close();
      } else {
        return resolve();
      }
    });
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

  set labels(labels: Set<string>) {
    if (!this.connection.socket || this.connection.socket.readyState !== WebSocket.OPEN) {
      throw new WebSocketNotInStateOpenException();
    }

    this.connection.socket.send(
      JSON.stringify({
        labels: labels.values(),
      })
    );
  }

  get labels(): Set<string> {
    return this._labels;
  }

  onActivityChanged(listener: (activity: UserActivity) => void) {
    this.eventEmitter.on('activity', listener);
  }

  onConnectionStateChanged(listener: (state: UserConnectionState) => void) {
    this.eventEmitter.on('connection_state', listener);
  }
}
