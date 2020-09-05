import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { Account } from '../../models/Account';
import { Call } from '../../models/Call';
import { User } from '../../models/User';

export const getCallStatusEventUrl = (call: Call) => {
  return `${process.env.PUBLIC_BASE_URL}/api/status-callback/accounts/${call.accountId}/calls/${call.id}/${call.direction}`;
};

// TODO allow base url with /
export const getConferenceStatusEventUrl = (call: Call) => {
  return `${process.env.PUBLIC_BASE_URL}/api/status-callback/accounts/${call.accountId}/calls/${call.id}/conference/${call.direction}`;
};

export const getOutboundUrl = (call: Call, user: User) => {
  return `${process.env.PUBLIC_BASE_URL}/api/callback/accounts/${user.account.id}/phone/outbound/${call.id}`;
};

export const getCallerId = (account: Account): string => {
  if (!account.configuration) {
    throw new ConfigurationNotFoundException();
  }

  if (account.configuration.outbound.isEnabled === false) {
    throw new InvalidConfigurationException('configuration has outbound disabled');
  }

  const callerId = account.configuration.outbound.phoneNumber;

  if (!callerId) {
    throw new InvalidConfigurationException('configuration has outbound enabled, but no phone number is missing');
  }

  return callerId;
};
