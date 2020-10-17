import * as Twilio from 'twilio';
import { Response, NextFunction } from 'express';
import { TwilioHelper } from '../helpers/twilio/TwilioHelper';
import { fetchAllIncomingPhoneNumbers, fetchAllOutgoingCallerIds } from './ConfigurationPhoneNumberController';
import { accountRepository } from '../worker';
import { AccountConfiguration } from '../models/AccountConfiguration';
import { RequestWithUser } from '../requests/RequestWithUser';
import { ConfigurationValidationFailedException } from '../exceptions/ConfigurationValidationFailedException';
import { getCallbackUrl } from './callback/PhoneHelper';
import { pool } from '../worker';
import { ConfigurationMessage } from '../models/socket/messages/ConfigurationMessage';

const update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = req.user.account;

    account.configuration = { ...account.configuration, ...req.body } as AccountConfiguration;

    if (!account.configuration.inbound.isEnabled) {
      account.configuration.inbound.phoneNumber = undefined;
    }

    if (!account.configuration.outbound.isEnabled) {
      account.configuration.outbound.phoneNumber = undefined;
    }

    const helper = new TwilioHelper(account);

    /* update phone number configuration on Twilio */
    if (account.configuration.inbound.isEnabled === true) {
      const voiceUrl = getCallbackUrl(`callback/accounts/${req.user.account.id}/phone/inbound`);
      const statusCallbackUrl = getCallbackUrl(`/callback/accounts/${req.user.account.id}/phone/inbound/completed`);

      await helper.configureInbound(account.configuration.inbound.phoneNumber as string, voiceUrl, statusCallbackUrl);
    }

    await accountRepository.update(account);

    if (account.configuration.inbound.isEnabled || account.configuration.outbound.isEnabled) {
      const users = pool.getAll(account);

      users.forEach((user) => user.broadcast(new ConfigurationMessage(user.getConfiguration())));
    }

    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

const validate = async (req: RequestWithUser, res: Response, next: Function) => {
  let { key, secret, accountSid } = req.body;
  /* configuration secret is write-only; assign secret from existing configuration */
  if (!req.body.secret) {
    const account = req.user.account;

    if (account.configuration && account.configuration.secret) {
      secret = account.configuration.secret;
    }
  }

  try {
    if (!key || key.length !== 34) {
      throw new ConfigurationValidationFailedException('KEY_INVALID');
    }

    if (!secret || secret.length !== 32) {
      throw new ConfigurationValidationFailedException('SECRET_INVALID');
    }

    if (!accountSid || accountSid.length !== 34) {
      throw new ConfigurationValidationFailedException('ACCOUNT_SID_INVALID');
    }

    let client = Twilio(key, secret, {
      accountSid: accountSid,
    });

    // we cannot acces /accounts or /keys with a regular key, try to fetch phone numbers instead
    let incomingPhoneNumbers = await fetchAllIncomingPhoneNumbers(client);
    let outgoingCallerIds = await fetchAllOutgoingCallerIds(client);

    if (
      req.body.inbound.isEnabled &&
      !incomingPhoneNumbers.some((item) => item.phoneNumber === req.body.inbound.phoneNumber)
    ) {
      throw new ConfigurationValidationFailedException('PHONE_NUMBER_NOT_ON_ACCOUNT');
    }

    throw new ConfigurationValidationFailedException('PHONE_NUMBER_NOT_ON_ACCOUNT');

    if (
      req.body.outbound.isEnabled &&
      req.body.mode === 'external-caller-id' &&
      !outgoingCallerIds.some((item) => item.phoneNumber === req.body.outbound.phoneNumber)
    ) {
      throw new ConfigurationValidationFailedException('CALLER_ID_NOT_ON_ACCOUNT');
    }

    res.status(200).end();
  } catch (error) {
    console.log(error);
    if (error instanceof ConfigurationValidationFailedException) {
      next(error);
    } else {
      next(new ConfigurationValidationFailedException('INVALID_TWILIO_CREDENTIALS'));
    }
  }
};

const fetch = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    res.json(req.user.account.getConfigurationWithoutSecret());
  } catch (error) {
    return next(error);
  }
};

export const ConfigurationController = {
  validate,
  update,
  fetch,
};
