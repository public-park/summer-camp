import { Call, CallDirection } from '../Call';
import { EventEmitter } from 'events';
import { User } from '../../models/User';
import { UserEvent } from '../../models/enums/UserEvent';
import { PhoneControl } from '../PhoneControl';

export class TwilioCall implements Call {
  private connection: any;

  readonly user: User;
  readonly id: string;
  readonly phoneNumber: string;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  isRecording: boolean;
  readonly direction: CallDirection;
  readonly createdAt: Date;
  answeredAt: Date | undefined;

  private eventEmitter: EventEmitter;

  constructor(id: string, user: User, phoneNumber: string, direction: CallDirection) {
    this.id = id;
    this.user = user;
    this.phoneNumber = phoneNumber;
    this.isConnected = false;
    this.isMuted = false;
    this.isOnHold = false;
    this.isRecording = false;
    this.direction = direction;
    this.createdAt = new Date();
    this.answeredAt = undefined;

    this.eventEmitter = new EventEmitter();
  }

  // TODO remove any
  registerConnection(connection: any) {
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

  async hold(state: boolean): Promise<void> {
    console.log(`call ${this.id}, set hold to ${state}`);

    const payload = await this.user.send(UserEvent.Hold, { id: this.id, state: state });

    this.isOnHold = payload.state;
  }

  async record(state: boolean): Promise<void> {
    console.log(`call ${this.id}, set record to ${state}`);

    const payload = await this.user.send(UserEvent.Hold, { id: this.id, state: state });

    this.isRecording = payload.state;
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
    this.eventEmitter.emit('answer');

    this.answeredAt = new Date();

    return this.user.send(UserEvent.Accept, { id: this.id });
  }

  end() {
    this.connection.disconnect();

    return Promise.resolve();
  }

  onConnectionStateChange(listener: (state: boolean) => void) {
    this.eventEmitter.on('connection_state', listener);
  }

  onAnswer(listener: () => void) {
    this.eventEmitter.on('answer', listener);
  }
}
