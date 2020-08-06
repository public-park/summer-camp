import * as Client from 'twilio-client';
import { PhoneControl } from '../PhoneControl';
import { Call, CallDirection } from '../Call';
import { TwilioCall } from './TwilioCall';
import { EventEmitter } from 'events';
import { PhoneState } from '../PhoneState';
import { User } from '../../models/User';

interface DelayedState {
  state: PhoneState;
  params: Array<any>;
}

export class TwilioPhone implements PhoneControl {
  private user: User;
  private readonly device: any;
  private state: PhoneState;
  private delayedState: DelayedState | undefined;
  private isInitialized: boolean;
  private readonly eventEmitter: EventEmitter;

  constructor(user: User) {
    this.user = user;
    this.device = new Client.Device();
    this.state = 'OFFLINE';
    this.delayedState = undefined;

    this.eventEmitter = new EventEmitter();

    this.isInitialized = false;
  }
  private setState(state: PhoneState, ...params: any) {
    this.state = state;

    if (this.delayedState && state === 'IDLE') {
      this.emitDelayedState();

      return;
    }

    this.eventEmitter.emit('state_changed', this.state, ...params);
  }

  private setDelayedState(state: PhoneState, ...params: any) {
    console.log('set delayed state to ' + state, ' params:', params);
    this.delayedState = { state, params };
  }

  private emitDelayedState() {
    if (this.delayedState) {
      const delayedState = this.delayedState;

      this.setState(delayedState.state, ...delayedState.params);
      this.delayedState = undefined;
    }
  }

  private registerConnectionListener(connection: any) {
    connection.on('reject', () => {
      this.setState('IDLE');
    });

    connection.on('disconnect', () => {
      this.setState('IDLE');
    });

    connection.on('cancel', () => {
      this.setState('IDLE');
    });

    connection.on('accept', () => {
      this.setState('BUSY');
    });
  }

  init(token: string) {
    this.setState('CONNECTING');

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
        this.user.send('presence', null, (payload: any) => {
          this.registerConnectionListener(connection);

          this.setState('RINGING', payload.call.from);

          this.eventEmitter.emit(
            'incoming',
            new TwilioCall(payload.call.id, this.user, payload.call.from, CallDirection.Inbound, connection)
          );
        });
      });

      this.device.on('ready', () => {
        console.log(`Twilio Device 'onReady' event`);

        this.setState('IDLE');
      });

      this.device.on('error', (error: any) => {
        let state: PhoneState;

        switch (error.code) {
          case 31205:
            state = 'EXPIRED';
            break;
          default:
            state = 'ERROR';
            break;
        }

        /* do not push this states while on the call */
        if (this.getState() === 'BUSY' || this.getState() === 'RINGING') {
          this.setDelayedState(state, error);
        } else {
          this.setState(state, error);
        }
      });
    } catch (error) {
      this.setState('ERROR', error);
    }
  }

  async call(phoneNumber: string): Promise<Call> {
    return new Promise((resolve, reject) => {
      this.user.send(
        'call',
        { to: phoneNumber },

        (payload: any) => {
          const connection = this.device.connect({ callId: payload.call.id });

          this.registerConnectionListener(connection);

          const call = new TwilioCall(payload.call.id, this.user, phoneNumber, CallDirection.Outbound, connection);

          this.eventEmitter.emit('outgoing', call);

          resolve(call);
        }
      );
    });
  }

  destroy() {
    this.setState('OFFLINE');

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

  onStateChanged(listener: (state: PhoneState) => void) {
    this.eventEmitter.on('state_changed', listener);
  }

  onError(listener: (error: Error) => void) {
    this.eventEmitter.on('error', listener);
  }

  setInputDevice(deviceId: string) {
    console.log(`set input device to: ${deviceId}`);

    return this.device.audio.setInputDevice(deviceId);
  }

  setOutputDevice(deviceId: string) {
    console.log(`set output device to: ${deviceId}`);

    return this.device.audio.speakerDevices.set(deviceId);
  }
}
