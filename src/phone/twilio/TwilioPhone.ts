import * as Client from 'twilio-client';
import { PhoneControl } from '../PhoneControl';
import { Call, CallDirection, CallStatus } from '../Call';
import { TwilioCall, TwilioConnection } from './TwilioCall';
import { EventEmitter } from 'events';
import { PhoneState } from '../PhoneState';
import { User } from '../../models/User';
import { PhoneNotReadyException } from '../../exceptions/PhoneNotReadyException';
import { InvalidPhoneStateException } from '../../exceptions/InvalidPhoneStateException';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { MessageType } from '../../models/socket/messages/Message';
import { CallMessage } from '../../models/socket/messages/CallMessage';
import { InitiateCallMessage } from '../../models/socket/messages/InitiateCallMessage';

interface DelayedState {
  state: PhoneState;
  params: Array<any>;
}

export class TwilioPhone implements PhoneControl {
  user: User | undefined;
  call: Call | undefined;
  private readonly device: any;
  private state: PhoneState;
  private delayedState: DelayedState | undefined;
  private isInitialized: boolean;
  private ringtone: HTMLAudioElement;

  private inputDeviceId: string | undefined;

  private readonly eventEmitter: EventEmitter;

  constructor() {
    this.user = undefined;
    this.device = new Client.Device();
    this.state = PhoneState.Offline;
    this.delayedState = undefined;
    this.inputDeviceId = undefined;
    this.call = undefined;
    this.ringtone = new Audio('https://sdk.twilio.com/js/client/sounds/releases/1.0.0/incoming.mp3?cache=1.12.3');

    this.eventEmitter = new EventEmitter();

    this.isInitialized = false;
  }

  private createCallFromMessage = (message: CallMessage) => {
    const { id, from, to, status, direction } = message.payload;

    return new TwilioCall(id, this.user as User, from, to, status, direction);
  };

  private setState(state: PhoneState, ...params: any) {
    this.state = state;

    if (this.delayedState && state === PhoneState.Idle) {
      this.emitDelayedState();

      return;
    }

    if (state === PhoneState.Error) {
      this.eventEmitter.emit('error', ...params);
    }

    this.eventEmitter.emit('state_changed', this.state, ...params);
  }

  private setDelayedState(state: PhoneState, ...params: any) {
    console.log(`set delayed state to ${state}  params:${JSON.stringify(params)}`);
    this.delayedState = { state, params };
  }

  private emitDelayedState() {
    if (this.delayedState) {
      const delayedState = this.delayedState;

      this.setState(delayedState.state, ...delayedState.params);
      this.delayedState = undefined;
    }
  }

  private async registerInputDeviceId() {
    this.inputDeviceId && this.device.audio && (await this.device.audio.setInputDevice(this.inputDeviceId));
  }

  private async unregisterInputDeviceId() {
    this.inputDeviceId && (await this.device.audio.unsetInputDevice(this.inputDeviceId));
  }

  init(token: string) {
    this.setState(PhoneState.Connecting);

    try {
      this.device.setup(token, {
        debug: true,
        codecPreferences: ['opus', 'pcmu'],
      });

      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;

      this.device.on('incoming', async (connection: TwilioConnection) => {
        if (!this.call) {
          return this.setState(PhoneState.Error, new CallNotFoundException());
        }

        await this.registerInputDeviceId();

        this.call.registerConnection(connection);

        connection.accept();

        this.eventEmitter.emit('connection', this.call);
      });

      this.device.on('ready', () => {
        console.log(`Twilio Device 'onReady' event`);

        this.setState(PhoneState.Idle);
      });

      this.device.on('error', (error: any) => {
        let state: PhoneState;

        switch (error.code) {
          case 31205:
            state = PhoneState.Expired;
            break;
          default:
            state = PhoneState.Error;
            break;
        }

        /* do not push this states while on the call */
        if (this.getState() === PhoneState.Busy || this.getState() === PhoneState.Ringing) {
          this.setDelayedState(state, error);
        } else {
          this.setState(state, error);
        }
      });
    } catch (error) {
      this.setState(PhoneState.Error, error);
    }
  }

  async connect(to: string): Promise<Call> {
    if (!this.user) {
      throw new PhoneNotReadyException();
    }

    if (this.state !== PhoneState.Idle) {
      throw new InvalidPhoneStateException();
    }

    const message = await this.user.send<InitiateCallMessage, CallMessage>(new InitiateCallMessage(to));

    this.call = this.createCallFromMessage(message);

    this.setState(PhoneState.Busy);

    this.eventEmitter.emit('call_state_changed', this.call);

    return this.call;
  }

  destroy() {
    this.setState(PhoneState.Offline);

    this.device.destroy();
  }

  getState() {
    return this.state;
  }

  onConnectionEstablished(listener: (call: Call) => void) {
    this.eventEmitter.on('connection', listener);
  }

  onStateChanged(listener: (state: PhoneState) => void) {
    this.eventEmitter.on('state_changed', listener);
  }

  onError(listener: (error: Error) => void) {
    this.eventEmitter.on('error', listener);
  }

  setInputDevice(deviceId: string) {
    console.log(`set input device to: ${deviceId}`);

    this.inputDeviceId = deviceId;
  }

  setOutputDevice(deviceId: string) {
    console.log(`set output device to: ${deviceId}`);

    return this.device.audio.speakerDevices.set(deviceId);
  }

  onCallStateChanged(listener: (call: Call | undefined) => void) {
    this.eventEmitter.on('call_state_changed', listener);
  }

  registerUser(user: User) {
    user.on<CallMessage>(MessageType.Call, async (message: CallMessage) => {
      if (this.hasEnded(message)) {
        this.call = undefined;

        this.setState(PhoneState.Idle);

        this.pauseRingtone();

        await this.unregisterInputDeviceId();
      }

      if (this.isNewIncoming(message)) {
        this.call = this.createCallFromMessage(message);

        this.setState(PhoneState.Ringing, this.call.from);

        this.playRingtone();

        this.call.onAnswer(() => {
          this.pauseRingtone();

          this.setState(PhoneState.Busy);
        });
      }

      if (this.call && message.payload) {
        this.call.status = message.payload.status;
      }

      this.eventEmitter.emit('call_state_changed', this.call);
    });

    this.user = user;
  }

  private hasEnded(message: CallMessage) {
    const { payload } = message;

    if (!payload) {
      return true;
    }

    return [CallStatus.NoAnswer, CallStatus.Failed, CallStatus.Busy, CallStatus.Completed].includes(payload.status);
  }

  private isNewIncoming(message: CallMessage) {
    const { payload } = message;

    if (!payload) {
      return false;
    }

    return payload.status === CallStatus.Ringing && payload.direction === CallDirection.Inbound;
  }

  private playRingtone() {
    this.ringtone.loop = true;
    this.ringtone.play();
  }

  private pauseRingtone() {
    this.ringtone.pause();
  }
}
