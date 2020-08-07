import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { CallDirection } from '../../models/CallDirection';
import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { Account } from '../../models/Account';
import { Call } from '../../models/Call';

export const getCallStatusEventUrl = (request: RequestWithAccount, call: Call) => {
  const { protocol, hostname } = request;

  return `${protocol}://${hostname}/api/status-callback/accounts/${call.accountId}/calls/${call.id}/${call.direction}`;
};

export const getConferenceStatusEventUrl = (request: RequestWithAccount, call: Call) => {
  const { protocol, hostname } = request;

  return `${protocol}://${hostname}/api/status-callback/accounts/${call.accountId}/calls/${call.id}/conference/${call.direction}`;
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
