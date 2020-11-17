import * as Twilio from 'twilio';

import { Response, NextFunction } from 'express';
import { accountRepository } from '../worker';
import { ConfigurationNotFoundException } from '../exceptions/ConfigurationNotFoundException';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';

export const fetchAllIncomingPhoneNumbers = async (client: Twilio.Twilio) => {
  const phoneNumbers = (await client.incomingPhoneNumbers.list()).filter(
    (phoneNumber) => phoneNumber.capabilities.voice
  );

  return phoneNumbers.map((phoneNumber) => {
    return {
      phoneNumber: phoneNumber.phoneNumber,
      friendlyName: phoneNumber.friendlyName,
    };
  });
};

export const fetchAllOutgoingCallerIds = async (client: Twilio.Twilio) => {
  const callerIds = await client.outgoingCallerIds.list();

  return callerIds.map((callerId) => {
    return { phoneNumber: callerId.phoneNumber, friendlyName: callerId.friendlyName };
  });
};

const fetch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(<string>req.params.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

    if (!account.configuration) {
      throw new ConfigurationNotFoundException();
    }

    const { key, secret, accountSid } = account.configuration;

    let client = Twilio(key, secret, {
      accountSid: accountSid,
    });

    let payload = {
      incomingPhoneNumbers: await fetchAllIncomingPhoneNumbers(client),
      outgoingCallerIds: await fetchAllOutgoingCallerIds(client),
    };

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const ConfigurationPhoneNumberController = {
  fetch,
};
