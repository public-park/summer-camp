import { Call, CallDirection } from '../Call';
import { EventEmitter } from 'events';
import { User } from '../../models/User';

export class TwilioCall implements Call {
  private readonly connection: any;

  readonly user: User;
  readonly id: string;
  readonly phoneNumber: string;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  readonly direction: CallDirection;
  readonly createdAt: Date;
  answeredAt: Date | undefined;

  private eventEmitter: EventEmitter;

  constructor(id: string, user: User, phoneNumber: string, direction: CallDirection, connection: any) {
    this.connection = connection;

    this.id = id;
    this.user = user;
    this.phoneNumber = phoneNumber;
    this.isConnected = false;
    this.isMuted = false;
    this.isOnHold = false;
    this.direction = direction;
    this.createdAt = new Date();
    this.answeredAt = undefined;

    this.eventEmitter = new EventEmitter();

    connection.on('warning', (name: string) => {
      console.log(`warning: ${name}`);
    });

    connection.on('warning-cleared', (name: string) => {
      console.log(`warning-cleared: ${name}`);
    });

    connection.on('accept', () => {
      this.setConnectionState(true);
    });

    connection.on('disconnect', () => {
      this.setConnectionState(false);
    });

    this.connection = connection;
  }

  private setConnectionState(state: boolean) {
    this.isConnected = state;
    this.eventEmitter.emit('connection_state', state);
  }

  reject() {
    this.connection.reject();

    return Promise.resolve();
  }

  hold(state: boolean): Promise<void> {
    console.log(`call ${this.id}, set hold to ${state}`);

    return new Promise((resolve, reject) => {
      this.user.send(
        'hold',
        { id: this.id, state: state },

        (payload: any) => {
          this.isOnHold = state;

          resolve(payload.state);
        }
      );
    });
  }

  sendDigits(digits: string) {
    this.connection.sendDigits(digits.toString());
  }

  mute(state: boolean) {
    this.isMuted = state;

    this.connection.mute(state);

    return Promise.resolve();
  }

  answer() {
    this.answeredAt = new Date();

    this.connection.accept();

    return Promise.resolve();
  }

  end() {
    this.connection.disconnect();

    return Promise.resolve();
  }

  onConnectionStateChange(listener: (state: boolean) => void) {
    this.eventEmitter.on('connection_state', listener);
  }
}
