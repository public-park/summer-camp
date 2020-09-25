import { Call, CallDirection } from '../Call';
import { EventEmitter } from 'events';
import { User } from '../../models/User';
import { UserEvent } from '../../models/enums/UserEvent';
import { UserHoldPayload, UserRecordPayload, UserAnswerPayload } from '../../models/UserMessage';
import { CallNotConnectedException } from '../../exceptions/CallNotConnectedException';

export interface TwilioConnection {
  reject: () => void;
  disconnect: () => void;
  sendDigits: (digit: string) => void;
  mute: (state: boolean) => void;
  accept: () => void;
  on: (event: string, listener: (name: string) => void) => void;
}

export class TwilioCall implements Call {
  private connection: TwilioConnection | undefined;

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

  registerConnection(connection: TwilioConnection) {
    connection.on('warning', (name: string) => {
      console.log(`warning: ${name}`);
    });

    connection.on('warning-cleared', (name: string) => {
      console.log(`warning-cleared: ${name}`);
    });

    connection.on('accept', () => {
      this.isConnected = true;
    });

    this.connection = connection;
  }

  reject() {
    if (!this.connection) {
      throw new CallNotConnectedException();
    }

    this.connection.reject();

    return Promise.resolve();
  }

  async hold(state: boolean): Promise<void> {
    console.log(`call ${this.id}, set hold to ${state}`);

    const request: UserHoldPayload = { id: this.id, state: state };

    const response = await this.user.send(UserEvent.Hold, request);

    this.isOnHold = response.state;
  }

  async record(state: boolean): Promise<void> {
    console.log(`call ${this.id}, set record to ${state}`);

    const request: UserRecordPayload = { id: this.id, state: state };

    const response = await this.user.send(UserEvent.Record, request);

    this.isRecording = response.state;
  }

  sendDigits(digits: string) {
    if (!this.connection) {
      throw new CallNotConnectedException();
    }

    this.connection.sendDigits(digits.toString());
  }

  mute(state: boolean) {
    if (!this.connection) {
      throw new CallNotConnectedException();
    }

    this.isMuted = state;

    this.connection.mute(state);

    return Promise.resolve();
  }

  answer() {
    this.eventEmitter.emit('answer');

    this.answeredAt = new Date();

    const request: UserAnswerPayload = { id: this.id };

    return this.user.send(UserEvent.Accept, request);
  }

  end() {
    if (!this.connection) {
      throw new CallNotConnectedException();
    }

    this.connection.disconnect();

    return Promise.resolve();
  }

  onAnswer(listener: () => void) {
    this.eventEmitter.on('answer', listener);
  }
}
