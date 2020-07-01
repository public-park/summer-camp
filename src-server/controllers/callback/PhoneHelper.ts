import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { CallDirection } from '../../models/CallDirection';
import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { Account } from '../../models/Account';
import { User } from '../../models/User';
import { Call } from '../../models/Call';

export const getStatusEventUrl = (
  request: RequestWithAccount,
  account: Account,
  call: Call,
  direction: CallDirection
) => {
  const { protocol, hostname } = request;

  return `${protocol}://${hostname}/api/callback/accounts/${account.id}/calls/${call.id}/status-event/${direction}`;
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
