import { Twilio } from 'twilio';
import { Account } from '../../models/Account';
import { User } from '../../models/User';
import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { log } from '../../logger';
import { AccountConfiguration } from '../../models/AccountConfiguration';
import { Call } from '../../models/Call';
import { CallStatus } from '../../models/CallStatus';
import { CallNotInProgressException } from '../../exceptions/CallNotInProgressException';
import { ConferenceNotFoundException } from '../../exceptions/ConferenceNotFoundException';
import { ConferenceParticipantNotFoundException } from '../../exceptions/ConferenceParticipantNotFoundException';

interface TwilioHelperOptions {
  accountSid: string;
  edge?: string;
}

export class TwilioCallControlHelper {
  client: Twilio;

  constructor(account: Account) {
    if (!account.hasConfiguration()) {
      throw new ConfigurationNotFoundException();
    }

    const { key, secret, accountSid } = account.configuration!;

    if (!key || !secret || !accountSid) {
      throw new InvalidConfigurationException();
    }

    const options: TwilioHelperOptions = {
      accountSid: accountSid,
    };

    if (process.env.TWILIO_API_EDGE) {
      options.edge = process.env.TWILIO_API_EDGE;
    }

    log.debug(`creating Twilio server-side client with options: ${JSON.stringify(options)}`);

    this.client = new Twilio(key, secret, {
      ...options,
    });
  }

  private getRecording = async (call: Call) => {
    if (!call.callSid || call.status !== CallStatus.InProgress) {
      throw new CallNotInProgressException();
    }

    const recordings = await this.client.calls(call.callSid).recordings.list();

    if (recordings.length === 0) {
      return undefined;
    }

    return recordings.filter((recording) => ['processing'].includes(recording.status))[0];
  };

  async record(call: Call, record: boolean) {
    log.info(`toggle recording on ${call.id} - callSid ${call.callSid} to ${record}`);

    if (!call.callSid || call.status !== CallStatus.InProgress) {
      throw new CallNotInProgressException();
    }

    const recording = await this.getRecording(call);

    /* create a new recording */
    if (!recording) {
      log.info(`start recording on ${call.id} - callSid ${call.callSid}`);

      return await this.client.calls(call.callSid).recordings.create({
        recordingChannels: 'dual',
      });
    } else {
      const status = record === false ? 'paused' : 'in-progress';

      log.info(`update recording on ${call.id} - callSid ${call.callSid} to ${status}`);

      return await this.client.calls(call.callSid).recordings(recording.sid).update({ status: status });
    }
  }

  async transfer(call: Call) {
    log.info(`transfer call ${call.id} - from ${call.transfer?.from} - to ${call.transfer?.to}`);

    if (!call.callSid || call.status !== CallStatus.Transfer) {
      throw new CallNotInProgressException();
    }

    await this.removeParticipantFromConference(call, 'agent');
  }

  async hold(call: Call, label: string, hold: boolean): Promise<void> {
    log.info(`hold ${call.id} - callSid ${call.callSid} set label ${label} to ${hold}`);

    const conferences = await this.client.conferences.list({
      friendlyName: call.id,
      status: 'in-progress',
      limit: 1,
    });

    if (!conferences[0]) {
      throw new ConferenceNotFoundException();
    }

    await this.client.conferences(conferences[0].sid).participants(label).update({ hold: hold });
  }

  async removeParticipantFromConference(call: Call, label: string) {
    const conferences = await this.client.conferences.list({
      friendlyName: call.id,
      status: 'in-progress',
      limit: 1,
    });

    if (!conferences[0]) {
      throw new ConferenceNotFoundException();
    }

    const participant = await this.client.conferences(conferences[0].sid).participants(label).fetch();

    if (!participant) {
      throw new ConferenceParticipantNotFoundException();
    }

    await this.client.conferences(conferences[0].sid).participants(participant.callSid).update({
      endConferenceOnExit: false,
    });

    await this.client.conferences(conferences[0].sid).participants(participant.callSid).remove();
  }
}

export const getIdentity = (user: User): string => {
  return user.id.split('-').join('_');
};
