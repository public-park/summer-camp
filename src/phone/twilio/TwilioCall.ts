import { Call } from '../../models/Call';
import { EventEmitter } from 'events';
import { User } from '../../models/User';
import { CallNotConnectedException } from '../../exceptions/CallNotConnectedException';
import { HoldMessage } from '../../models/socket/messages/HoldMessage';
import { RecordMessage } from '../../models/socket/messages/RecordMessage';
import { AcceptMessage } from '../../models/socket/messages/AcceptMessage';
import { CallDirection } from '../../models/CallDirection';
import { CallStatus } from '../../models/CallStatus';

export interface TwilioConnection {
  reject: () => void;
  disconnect: () => void;
  sendDigits: (digit: string) => void;
  mute: (state: boolean) => void;
  accept: () => void;
  on: (event: string, listener: (name: string) => void) => void;
}

enum CallEventType {
  Answer = 'answer',
  End = 'end',
}

export class TwilioCall implements Call {
  _connection: TwilioConnection | undefined;

  readonly user: User;
  readonly id: string;
  readonly from: string;
  readonly to: string;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  isRecording: boolean;
  readonly direction: CallDirection;
  status: CallStatus;
  readonly createdAt: Date;
  answeredAt: Date | undefined;

  private eventEmitter: EventEmitter;

  constructor(id: string, user: User, from: string, to: string, status: CallStatus, direction: CallDirection) {
    this.id = id;
    this.user = user;
    this.from = from;
    this.to = to;
    this.isConnected = false;
    this.isMuted = false;
    this.isOnHold = false;
    this.isRecording = false;
    this.direction = direction;
    this.status = status;
    this.createdAt = new Date();
    this.answeredAt = undefined;

    this.eventEmitter = new EventEmitter();
  }

  reject() {
    if (!this._connection) {
      throw new CallNotConnectedException();
    }

    this._connection.reject();

    return Promise.resolve();
  }

  async hold(state: boolean): Promise<void> {
    if (!this.connection) {
      throw new CallNotConnectedException();
    }

    console.log(`call ${this.id}, set hold to ${state}`);

    await this.user.connection.send<HoldMessage, HoldMessage>(new HoldMessage(this.id, state));

    this.isOnHold = state;
  }

  async transfer(user: User): Promise<void> {
    return Promise.reject('not implemented');
  }

  async record(state: boolean): Promise<void> {
    if (!this.connection) {
      throw new CallNotConnectedException();
    }

    console.log(`call ${this.id}, set record to ${state}`);

    await this.user.connection.send<RecordMessage, RecordMessage>(new RecordMessage(this.id, state));

    this.isRecording = state;
  }

  sendDigits(digits: string) {
    if (!this._connection) {
      throw new CallNotConnectedException();
    }

    this._connection.sendDigits(digits.toString());
  }

  mute(state: boolean) {
    if (!this._connection) {
      throw new CallNotConnectedException();
    }

    this.isMuted = state;

    this._connection.mute(state);

    return Promise.resolve();
  }

  async answer() {
    this.eventEmitter.emit(CallEventType.Answer);

    this.answeredAt = new Date();

    await this.user.connection.send(new AcceptMessage(this.id));

    return;
  }

  async end() {
    console.debug(`local disconnect initiated by call.end()`);

    if (!this._connection) {
      throw new CallNotConnectedException();
    }

    this._connection.disconnect();

    return Promise.resolve();
  }

  get connection() {
    return this._connection;
  }

  set connection(connection: TwilioConnection | undefined) {
    if (!connection) {
      return;
    }

    connection.on('warning', (name: string) => {
      console.info(`warning: ${name}`);
    });

    connection.on('warning-cleared', (name: string) => {
      console.info(`warning-cleared: ${name}`);
    });

    connection.on('accept', () => {
      console.debug(`receive 'accept' event by Twilio Connection`);

      this.isConnected = true;
    });

    connection.on('disconnect', () => {
      console.debug(`receive 'disconnect' event by Twilio Connection`);

      this.isConnected = false;

      this.eventEmitter.emit(CallEventType.End);
    });

    this._connection = connection;
  }

  onAnswer(listener: () => void) {
    this.eventEmitter.on(CallEventType.Answer, listener);
  }

  onEnd(listener: () => void) {
    this.eventEmitter.on(CallEventType.End, listener);
  }

  removeAllListeners() {
    this.eventEmitter.removeAllListeners(CallEventType.Answer);
    this.eventEmitter.removeAllListeners(CallEventType.End);
  }
}
