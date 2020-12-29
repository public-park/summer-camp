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
import { Call } from '../../models/Call';
import { getCallerId, getCallbackUrl } from '../../controllers/callback/PhoneHelper';
import { CallListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { createConferenceTwiml } from './TwilioTwimlHelper';

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

  async updatePhoneNumberConfiguration(
    phoneNumber: string,
    voiceUrl: string,
    statusCallbackUrl: string
  ): Promise<undefined> {
    const phoneNumbers = await this.client.incomingPhoneNumbers.list({ phoneNumber: phoneNumber });

    if (phoneNumbers.length === 1 && phoneNumbers[0]) {
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

  async addUserToConference(call: Call) {
    return await this.addParticipantToConference(
      call.id,
      call.to,
      `client:${getIdentityByUserId(<string>call.userId)}`,
      'agent',
      getCallbackUrl(`status-callback/accounts/${call.accountId}/calls/${call.id}/status`),
      ['answered']
    );
  }

  async addCustomerToConference(call: Call) {
    return await this.addParticipantToConference(
      call.id,
      call.from,
      call.to,
      'customer',
      getCallbackUrl(`status-callback/accounts/${call.accountId}/calls/${call.id}/status`),
      ['ringing', 'answered', 'completed']
    );
  }

  async endCall(call: Call) {
    if (!call.callSid) {
      throw new ServerException('callSid not found');
    }

    return await this.client.calls(call.callSid).update({ status: 'completed' });
  }

  private async addParticipantToConference(
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

    const { callSid } = await this.client.conferences(conferenceName).participants.create(options);

    return callSid;
  }

  async initiateOutgoingCall(call: Call, user: User, account: Account): Promise<string> {
    const options: CallListInstanceCreateOptions = {
      twiml: createConferenceTwiml(call, 'agent'),
      to: `client:${getIdentityByUserId(<string>user.id)}`,
      from: getCallerId(account),
    };

    const { sid } = await this.client.calls.create(options);

    return sid;
  }
}

export const createVoiceToken = (account: Account, user: User, lifetime: number = 600): string => {
  if (!account.hasConfiguration()) {
    throw new ConfigurationNotFoundException();
  }

  const { key, secret, accountSid } = account.configuration!;

  if (!key || !secret || !accountSid) {
    throw new InvalidConfigurationException();
  }

  const accessToken = new AccessToken(accountSid, key, secret, {
    ttl: lifetime,
  });

  log.info(`create phone token for ${user.id} (${user.name})`);

  const token = accessToken as VoiceAccessToken;

  token.identity = getIdentityByUserId(user.id);

  token.addGrant(new AccessToken.VoiceGrant({ incomingAllow: true }));

  return token.toJwt();
};

export const getIdentityByUserId = (userId: string): string => {
  return userId.split('-').join('_');
};
