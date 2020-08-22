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
import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { getCallStatusEventUrl } from '../../controllers/callback/PhoneHelper';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';

interface VoiceAccessToken extends AccessToken {
  identity: string;
}

interface TwilioHelperOptions {
  edge: string;
}

export class TwilioHelper {
  client: Twilio;

  // TODO add edge to configuration, env param TWILIO_API_EDGE=frankfurt
  constructor(account: Account, options?: TwilioHelperOptions) {
    if (!account.hasConfiguration()) {
      throw new ConfigurationNotFoundException();
    }

    const { key, secret, accountSid } = account.configuration as AccountConfiguration;

    if (!key || !secret || !accountSid) {
      throw new InvalidConfigurationException();
    }

    this.client = new Twilio(key, secret, {
      ...options,
      accountSid: accountSid,
      edge: 'frankfurt',
    });
  }

  async getOrCreateTwimlApplication(applicationSid: string | undefined): Promise<string> {
    if (!applicationSid) {
      const application = await this.createTwimlApplication();

      return application.sid;
    }

    try {
      const application = await this.client.applications(applicationSid).fetch();

      return application.sid;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }

      const application = await this.createTwimlApplication();

      return application.sid;
    }
  }

  async createTwimlApplication(): Promise<any> {
    const application = await this.client.applications.create({
      friendlyName: 'Summer Camp - Phone',
    });

    return application;
  }

  async updateTwimlApplication(applicationSid: string, url: string): Promise<string> {
    const application = await this.client.applications(applicationSid).update({
      voiceUrl: url,
      voiceMethod: 'POST',
    });

    return application.sid;
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

  async configureOutbound(applicationSid: string | undefined, url: string): Promise<string> {
    const sid = await this.getOrCreateTwimlApplication(applicationSid);

    await this.updateTwimlApplication(sid, url);

    return sid;
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

  async addUserToConference(request: RequestWithAccount, call: Call) {
    await this.addParticipantToConference(
      call.id,
      call.to,
      `client:${getIdentityByUserId(<string>call.userId)}`,
      'agent',
      getCallStatusEventUrl(request, call)
    );
  }

  async addCustomerToConference(request: RequestWithAccount, call: Call) {
    await this.addParticipantToConference(
      call.id,
      call.from,
      call.to,
      'customer',
      getCallStatusEventUrl(request, call)
    );
  }

  async addParticipantToConference(
    conferenceName: string,
    from: string,
    to: string,
    label: string,
    statusEventUrl: string
  ): Promise<string> {
    let options: ParticipantListInstanceCreateOptions = {
      to: to,
      from: from,
      earlyMedia: true,
      endConferenceOnExit: true,
      label: label,
      timeout: 45,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      statusCallback: statusEventUrl,
    };

    const call = await this.client.conferences(conferenceName).participants.create(options);

    return call.callSid;
  }

  async holdParticipant(conferenceName: string, label: string, hold: boolean): Promise<void> {
    const conferences = await this.client.conferences.list({
      friendlyName: conferenceName,
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

  if (user.account.configuration && user.account.configuration.outbound.isEnabled) {
    options.outgoingApplicationSid = user.account.configuration.applicationSid;
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
