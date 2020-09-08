import { Twilio } from 'twilio';
import { Account } from '../../models/Account';
import { User } from '../../models/User';
import AccessToken = require('twilio/lib/jwt/AccessToken');
import { ServerException } from '../../exceptions/ServerException';
import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { log } from '../../logger';
import { AccountConfiguration } from '../../models/AccountConfiguration';
import { ParticipantListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/conference/participant';
import { CallConnectionType } from '../../models/CallConnectionType';
import { Call } from '../../models/Call';
import { getCallStatusEventUrl, getCallerId, getOutboundUrl } from '../../controllers/callback/PhoneHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { CallStatus } from '../../models/CallStatus';
import { CallNotInProgressException } from '../../exceptions/CallNotInProgressException';

interface VoiceAccessToken extends AccessToken {
  identity: string;
}

interface TwilioHelperOptions {
  accountSid: string;
  edge?: string;
}

export class TwilioHelper {
  client: Twilio;

  constructor(account: Account) {
    if (!account.hasConfiguration()) {
      throw new ConfigurationNotFoundException();
    }

    const { key, secret, accountSid } = account.configuration as AccountConfiguration;

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

  async configureInbound(phoneNumber: string, voiceUrl: string, statusCallbackUrl: string): Promise<undefined> {
    const phoneNumbers = await this.client.incomingPhoneNumbers.list({ phoneNumber: phoneNumber });

    if (phoneNumbers.length === 1) {
      await this.client.incomingPhoneNumbers(phoneNumbers[0].sid).update({
        voiceUrl: voiceUrl,
        voiceMethod: 'POST',
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: 'POST',
      });

      return;
    } else {
      if (phoneNumbers.length === 0) {
        throw new ServerException('phone number not found');
      } else {
        throw new ServerException('more than one phone number found');
      }
    }
  }

  getCallConnectionType = (endpoint: string): CallConnectionType => {
    if (endpoint.startsWith('client:')) {
      return CallConnectionType.WebRTC;
    }

    if (endpoint.startsWith('sip:')) {
      return CallConnectionType.SIP;
    }

    if (endpoint.startsWith('+')) {
      return CallConnectionType.PhoneNumber;
    }

    throw new Error();
  };

  async getCall(callSid: string) {
    return await this.client.calls(callSid).fetch();
  }

  getActiveRecording = async (call: Call) => {
    if (!call.callSid || call.status !== CallStatus.InProgress) {
      throw new CallNotInProgressException();
    }

    const recordings = await this.client.calls(call.callSid).recordings.list();

    if (recordings.length === 0) {
      return undefined;
    }

    return recordings.filter((recording) => ['processing'].includes(recording.status))[0];
  };

  async setRecording(call: Call, record: boolean) {
    log.info(`toggle recording on ${call.id} - callSid ${call.callSid} to ${record}`);

    if (!call.callSid || call.status !== CallStatus.InProgress) {
      throw new CallNotInProgressException();
    }

    const recording = await this.getActiveRecording(call);

    /* create a new recording */
    if (!recording) {
      /* disable recording on a call without active recording ... */
      if (!record) {
        return;
      }

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

  async addUserToConference(call: Call) {
    await this.addParticipantToConference(
      call.id,
      call.to,
      `client:${getIdentityByUserId(<string>call.userId)}`,
      'agent',
      getCallStatusEventUrl(call),
      ['answered']
    );
  }

  async addCustomerToConference(call: Call) {
    await this.addParticipantToConference(call.id, call.from, call.to, 'customer', getCallStatusEventUrl(call), [
      'ringing',
      'answered',
      'completed',
    ]);
  }

  async addParticipantToConference(
    conferenceName: string,
    from: string,
    to: string,
    label: string,
    statusEventUrl: string,
    statusEvents: string[]
  ): Promise<string> {
    let options: ParticipantListInstanceCreateOptions = {
      to: to,
      from: from,
      earlyMedia: true,
      endConferenceOnExit: true,
      label: label,
      timeout: 45,
      statusCallbackEvent: statusEvents,
      statusCallbackMethod: 'POST',
      statusCallback: statusEventUrl,
    };

    const call = await this.client.conferences(conferenceName).participants.create(options);

    return call.callSid;
  }

  async connectUser(call: Call, user: User): Promise<string> {
    const options: CallListInstanceCreateOptions = {
      url: getOutboundUrl(call, user),
      to: `client:${getIdentityByUserId(<string>user.id)}`,
      from: getCallerId(user.account),
    };

    const response = await this.client.calls.create(options);

    return response.sid;
  }

  async holdParticipant(call: Call, label: string, hold: boolean): Promise<void> {
    log.info(`hold ${call.id} - callSid ${call.callSid} set label ${label} to ${hold}`);

    const conferences = await this.client.conferences.list({
      friendlyName: call.id,
      status: 'in-progress',
      limit: 1,
    });

    if (!conferences[0]) {
      throw new CallNotFoundException();
    }

    await this.client.conferences(conferences[0].sid).participants(label).update({ hold: hold });
  }
}

export const createVoiceToken = (user: User, lifetime: number = 600): string => {
  if (!user.account.hasConfiguration()) {
    throw new ConfigurationNotFoundException();
  }

  const { key, secret, accountSid } = user.account.configuration as AccountConfiguration;

  if (!key || !secret || !accountSid) {
    throw new InvalidConfigurationException();
  }

  const accessToken = new AccessToken(accountSid, key, secret, {
    ttl: lifetime,
  });

  log.info(`create phone token for ${user.id} (${user.name})`);

  const options: AccessToken.VoiceGrantOptions = {};

  if (user.account.configuration && user.account.configuration.inbound.isEnabled) {
    options.incomingAllow = true;
  }

  const grant = new AccessToken.VoiceGrant(options);

  const token = accessToken as VoiceAccessToken;

  token.identity = getIdentity(user);

  token.addGrant(grant);

  return token.toJwt();
};

export const getIdentity = (user: User): string => {
  return user.id.split('-').join('_');
};

export const getIdentityByUserId = (userId: string): string => {
  return userId.split('-').join('_');
};

export const convertIdentityToUserId = (identity: string): string => {
  return identity.replace('client:', '').split('_').join('-');
};
