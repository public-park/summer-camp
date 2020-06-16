import * as Twilio from 'twilio';

import { Request, Response, NextFunction } from 'express';
import { accountRepository } from '../worker';
import { AccountNotFoundError } from '../repository/AccountNotFoundError';
import { ConfigurationNotFoundException } from '../exceptions/ConfigurationNotFoundException';

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

const fetch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(<string>req.params.accountId);

    if (!account) {
      throw new AccountNotFoundError();
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
