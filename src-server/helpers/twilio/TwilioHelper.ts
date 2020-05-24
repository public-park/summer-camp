import { Twilio } from 'twilio';
import { Account } from '../../models/Account';
import { User } from '../../models/User';
import AccessToken = require('twilio/lib/jwt/AccessToken');
import { ServerException } from '../../exceptions/ServerException';
import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { log } from '../../logger';

interface VoiceAccessToken extends AccessToken {
  identity: string;
}

export class TwilioHelper {
  client: Twilio;

  constructor(key: string, secret: string, accountSid: string) {
    this.client = new Twilio(key, secret, {
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

  async configureInbound(phoneNumber: string, url: string): Promise<undefined> {
    const phoneNumbers = await this.client.incomingPhoneNumbers.list({ phoneNumber: phoneNumber });

    if (phoneNumbers.length === 1) {
      await this.client.incomingPhoneNumbers(phoneNumbers[0].sid).update({
        voiceUrl: url,
        voiceMethod: 'POST',
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
}

export const createVoiceToken = (account: Account, user: User, lifetime: number = 600): string => {
  if (!account.configuration) {
    throw new ConfigurationNotFoundException();
  }

  if (
    !account.configuration.key ||
    !account.configuration.secret ||
    !account.configuration.accountSid ||
    !account.configuration.applicationSid
  ) {
    throw new InvalidConfigurationException();
  }

  const accessToken = new AccessToken(
    account.configuration.accountSid,
    account.configuration.key,
    account.configuration.secret,
    { ttl: lifetime }
  );

  log.info(`create phone token for  ${user.id} (${user.name})`);

  const grant = new AccessToken.VoiceGrant({
    incomingAllow: true,
    outgoingApplicationSid: account.configuration.applicationSid,
  });

  const token = accessToken as VoiceAccessToken;

  token.identity = getIdentity(user);

  token.addGrant(grant);

  return token.toJwt();
};

export const getIdentity = (user: User): string => {
  return user.id.replace('-', '_');
};
