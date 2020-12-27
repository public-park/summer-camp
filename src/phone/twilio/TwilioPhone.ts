import * as Client from 'twilio-client';
import { PhoneControl } from '../PhoneControl';
import { Call } from '../../models/Call';
import { TwilioCall } from './TwilioCall';
import { EventEmitter } from 'events';
import { PhoneState } from '../PhoneState';
import { User } from '../../models/User';
import { InvalidPhoneStateException } from '../../exceptions/InvalidPhoneStateException';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { MessageType } from '../../models/socket/messages/Message';
import { CallMessage } from '../../models/socket/messages/CallMessage';
import { InitiateCallMessage } from '../../models/socket/messages/InitiateCallMessage';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';

interface DelayedState {
  state: PhoneState;
  params: Array<any>;
}

enum PhoneEventType {
  StateChanged = 'state_changed',
  CallStateChanged = 'call_state_changed',
  Error = 'error',
}

export class TwilioPhone implements PhoneControl {
  private readonly user: User;
  call: TwilioCall | undefined;
  private readonly device: any;
  private state: PhoneState;
  private delayedState: DelayedState | undefined;
  private isInitialized: boolean;
  private ringtone: HTMLAudioElement;
  private inputDeviceId: string | undefined;
  private constraints: MediaTrackConstraints | undefined;

  private readonly eventEmitter: EventEmitter;

  constructor(user: User) {
    user.connection.on<CallMessage>(MessageType.Call, async (message: CallMessage) => {
      if (this.hasEnded(message)) {
        this.pauseRingtone();

        await this.onCallEnd();
      }

      if (this.isNewOutgoing(message)) {
        return;
      }

      if (this.isNewIncoming(message)) {
        this.call = this.convertMessageToCall(message);

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

      this.eventEmitter.emit(PhoneEventType.CallStateChanged, this.call);
    });

    this.user = user;

    this.device = new Client.Device();
    this.state = PhoneState.Offline;
    this.delayedState = undefined;
    this.inputDeviceId = undefined;
    this.call = undefined;
    this.ringtone = new Audio('https://sdk.twilio.com/js/client/sounds/releases/1.0.0/incoming.mp3?cache=1.12.5');

    this.eventEmitter = new EventEmitter();

    this.isInitialized = false;
  }

  private async onCallEnd() {
    if (!this.call) {
      return;
    }

    this.call.removeAllListeners();
    this.call = undefined;

    this.setState(PhoneState.Idle);
  }

  private convertMessageToCall(message: CallMessage) {
    const { id, from, to, status, direction } = message.payload;

    return new TwilioCall(id, this.user, from, to, status, direction);
  }

  getState() {
    return this.state;
  }

  private setState(state: PhoneState, ...params: any) {
    this.state = state;

    if (this.delayedState && state === PhoneState.Idle) {
      this.emitDelayedState();

      return;
    }

    if (state === PhoneState.Error) {
      this.eventEmitter.emit('error', ...params);
    }

    this.eventEmitter.emit(PhoneEventType.StateChanged, this.state, ...params);
  }

  private setDelayedState(state: PhoneState, ...params: any) {
    console.log(`set delayed state to ${state}  params:${JSON.stringify(params)}`);
    this.delayedState = { state, params };
  }

  private emitDelayedState() {
    if (this.delayedState) {
      this.setState(this.delayedState.state, ...this.delayedState.params);
      this.delayedState = undefined;
    }
  }

  init(token: string, edge?: string) {
    if ([PhoneState.Offline, PhoneState.Expired].includes(this.state)) {
      this.setState(PhoneState.Connecting);
    }

    edge =
      edge && ['sydney', 'sao-paulo', 'dublin', 'frankfurt', 'tokyo', 'singapore', 'ashburn'].includes(edge)
        ? edge
        : 'roaming';

    try {
      this.device.setup(token, {
        debug: true,
        edge: edge,
        codecPreferences: ['opus', 'pcmu'],
      });

      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;

      this.device.on('incoming', async (connection: Client.Connection) => {
        if (!this.call) {
          return this.setState(PhoneState.Error, new CallNotFoundException());
        }

        if (this.constraints) {
          await this.device.audio.setAudioConstraints(this.constraints);
        }

        if (this.inputDeviceId) {
          await this.device.audio.setInputDevice(this.inputDeviceId);
        }

        this.call.connection = connection;

        connection.accept(this.constraints);
      });

      this.device.on('ready', () => {
        console.debug(`Twilio Device 'onReady' event`);

        /* disable ringtone on Twilio Device */
        this.device.audio.incoming(false);

        this.setState(PhoneState.Idle);
      });

      this.device.on('offline', () => {
        console.debug(`Twilio Device 'offline' event`);
      });

      this.device.on('disconnect', async () => {
        if (this.inputDeviceId && this.device.audio) {
          await this.device.audio.unsetInputDevice(this.inputDeviceId);
        }

        await this.onCallEnd();
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

        /* do not publish states while on the call */
        if (this.state === PhoneState.Busy || this.state === PhoneState.Ringing) {
          this.setDelayedState(state, error);
        } else {
          this.setState(state, error);
        }
      });
    } catch (error) {
      this.setState(PhoneState.Error, error);
    }
  }

  async connect(to: string, from?: string): Promise<Call> {
    console.info(`connect to ${to}`);

    if (this.state !== PhoneState.Idle) {
      throw new InvalidPhoneStateException();
    }

    const message = await this.user.connection.send<InitiateCallMessage, CallMessage>(
      new InitiateCallMessage(to, from)
    );

    this.setState(PhoneState.Busy);

    this.call = this.convertMessageToCall(message);

    this.eventEmitter.emit(PhoneEventType.CallStateChanged, this.call);

    return this.call;
  }

  destroy() {
    this.setState(PhoneState.Offline);

    /* reject current call in state ringing */
    if (this.state === PhoneState.Ringing && this.call) {
      this.call.reject();
    }

    this.device.destroy();
  }

  onStateChanged(listener: (state: PhoneState) => void) {
    this.eventEmitter.on(PhoneEventType.StateChanged, listener);
  }

  onError(listener: (error: Error) => void) {
    this.eventEmitter.on(PhoneEventType.Error, listener);
  }

  setInputDevice(deviceId: string) {
    console.info(`set input device to: ${deviceId}`);

    this.inputDeviceId = deviceId;
  }

  async setOutputDevice(deviceId: string) {
    console.info(`set output device to: ${deviceId}`);

    return this.device.audio.speakerDevices.set(deviceId);
  }

  onCallStateChanged(listener: (call: Call | undefined) => void) {
    this.eventEmitter.on(PhoneEventType.CallStateChanged, listener);
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

  private isNewOutgoing(message: CallMessage) {
    const { payload } = message;

    if (!payload) {
      return false;
    }

    return payload.status === CallStatus.Initiated && payload.direction === CallDirection.Outbound;
  }

  private playRingtone() {
    this.ringtone.loop = true;
    this.ringtone.play();
  }

  private pauseRingtone() {
    this.ringtone.pause();
  }

  async setConstraints(constraints: MediaTrackConstraints) {
    this.constraints = constraints;

    if (this.device && this.device.audio) {
      await this.device.audio.setAudioConstraints(this.constraints);
    }
  }
}
