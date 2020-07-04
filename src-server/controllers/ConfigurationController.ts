import * as Twilio from 'twilio';
import { Request, Response, NextFunction } from 'express';
import { TwilioHelper } from '../helpers/twilio/TwilioHelper';
import { fetchAllIncomingPhoneNumbers, fetchAllOutgoingCallerIds } from './ConfigurationPhoneNumberController';
import { AccountNotFoundError } from '../repository/AccountNotFoundError';
import { accountRepository } from '../worker';
import { AccountConfiguration } from '../models/AccountConfiguration';
import { RequestWithUser } from '../requests/RequestWithUser';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { ConfigurationValidationFailedException } from '../exceptions/ConfigurationValidationFailedException';

const update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(req.params.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    account.configuration = { ...account.configuration, ...req.body } as AccountConfiguration;

    const helper = new TwilioHelper(
      account.configuration.key as string,
      account.configuration.secret as string,
      account.configuration.accountSid as string
    );

    /* update phone number configuration on Twilio */
    if (account.configuration.inbound.isEnabled === true) {
      const voiceUrl = `${req.protocol}://${req.hostname}/api/callback/accounts/${req.user.accountId}/phone/inbound`;
      const statusCallbackUrl = `${req.protocol}://${req.hostname}/api/callback/accounts/${req.user.accountId}/phone/inbound/completed`;

      await helper.configureInbound(account.configuration.inbound.phoneNumber as string, voiceUrl, statusCallbackUrl);
    }

    if (account.configuration.outbound.isEnabled === true) {
      const url = `${req.protocol}://${req.hostname}/api/callback/accounts/${req.user.accountId}/phone/outbound`;

      const applicationSid = await helper.configureOutbound(account.configuration.applicationSid, url);

      account.configuration.applicationSid = applicationSid;
    }

    await accountRepository.update(account);

    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

const validate = async (req: Request, res: Response, next: Function) => {
  let { key, secret, accountSid } = req.body;

  /* configuration secret is write-only; assign secret from existing configuration */
  if (!req.body.secret) {
    const account = await accountRepository.getById(req.params.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

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

    // validate if callerIds and phone number are still on account
    if (
      req.body.inbound.isEnabled &&
      !incomingPhoneNumbers.some((item) => item.phoneNumber === req.body.inbound.phoneNumber)
    ) {
      throw new ConfigurationValidationFailedException('PHONE_NUMBER_NOT_ON_ACCOUNT');
    }

    if (
      req.body.outbound.isEnabled &&
      req.body.mode === 'external-caller-id' &&
      !outgoingCallerIds.some((item) => item.phoneNumber === req.body.outbound.phoneNumber)
    ) {
      throw new ConfigurationValidationFailedException('CALLER_ID_NOT_ON_ACCOUNT');
    }

    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

const fetch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(<string>req.params.accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    const payload = account.configuration;

    if (payload) {
      delete payload.secret;
    }

    res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const ConfigurationController = {
  validate,
  update,
  fetch,
};
