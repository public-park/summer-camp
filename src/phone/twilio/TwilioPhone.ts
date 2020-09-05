import * as Client from 'twilio-client';
import { PhoneControl } from '../PhoneControl';
import { Call, CallDirection, CallStatus } from '../Call';
import { TwilioCall } from './TwilioCall';
import { EventEmitter } from 'events';
import { PhoneState } from '../PhoneState';
import { User } from '../../models/User';
import { UserEvent } from '../../models/enums/UserEvent';
import { PhoneNotReadyException } from '../../exceptions/PhoneNotReadyException';
import { InvalidPhoneStateException } from '../../exceptions/InvalidPhoneStateException';

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

  private inputDeviceId: string | undefined;

  private readonly eventEmitter: EventEmitter;

  constructor() {
    this.user = undefined;
    this.device = new Client.Device();
    this.state = PhoneState.Offline;
    this.delayedState = undefined;
    this.inputDeviceId = undefined;
    this.call = undefined;

    this.eventEmitter = new EventEmitter();

    this.isInitialized = false;
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

  private async resetAll() {
    await this.unregisterInputDeviceId();

    this.setState(PhoneState.Idle);

    this.call = undefined;
  }

  private async registerInputDeviceId() {
    this.inputDeviceId && (await this.device.audio.setInputDevice(this.inputDeviceId));
  }

  private async unregisterInputDeviceId() {
    this.inputDeviceId && (await this.device.audio.unsetInputDevice(this.inputDeviceId));
  }

  private registerConnectionListener(connection: any) {
    connection.on('reject', async () => {
      await this.resetAll();
    });

    connection.on('disconnect', async () => {
      await this.resetAll();
    });

    connection.on('cancel', async () => {
      await this.resetAll();
    });
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

      this.device.on('incoming', async (connection: any) => {
        await this.registerInputDeviceId();

        this.registerConnectionListener(connection);

        this.call?.registerConnection(connection);

        connection.accept();
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

    const { call } = await this.user.send(UserEvent.Call, { to: to });

    this.call = new TwilioCall(call.id, <User>this.user, call.to, call.direction);

    this.setState(PhoneState.Busy);

    this.eventEmitter.emit('outgoing', this.call);

    return this.call;
  }

  destroy() {
    this.setState(PhoneState.Offline);

    //this.eventEmitter.removeAllListeners();

    this.device.destroy();
  }

  getState() {
    return this.state;
  }

  onIncomingCall(listener: (call: Call) => void) {
    this.eventEmitter.on('incoming', listener);
  }

  onOutgoingCall(listener: (call: Call) => void) {
    this.eventEmitter.on('outgoing', listener);
  }

  onCallComplete(listener: () => void) {
    this.eventEmitter.on('complete', listener);
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

  registerUser(user: User) {
    // TODO payload, CallResponse
    user.on(UserEvent.Call, (call: any) => {
      if (call === null) {
        this.eventEmitter.emit('complete');

        this.setState(PhoneState.Idle);

        return;
      }

      if (call.status == CallStatus.Ringing && call.direction === CallDirection.Inbound) {
        this.call = new TwilioCall(call.id, <User>this.user, call.from, call.direction);

        this.call.onAnswer(() => {
          this.setState(PhoneState.Busy);
        });

        this.eventEmitter.emit('incoming', this.call);

        this.setState(PhoneState.Ringing, this.call.phoneNumber);
      }

      if (call.status == CallStatus.NoAnswer && call.direction === CallDirection.Inbound) {
        this.setState(PhoneState.Idle);
      }
    });

    this.user = user;
  }
}
