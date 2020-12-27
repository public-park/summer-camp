import { ConfigurationNotFoundException } from '../../exceptions/ConfigurationNotFoundException';
import { InvalidConfigurationException } from '../../exceptions/InvalidConfigurationException';
import { stripLeadingSlash, stripTrailingSlash } from '../../helpers/UrlHelper';
import { Account } from '../../models/Account';

export const getCallbackUrl = (path: string) => {
  if (!process.env.PUBLIC_BASE_URL) {
    throw new InvalidConfigurationException();
  }

  const segment = stripLeadingSlash(path);
  const base = stripTrailingSlash(process.env.PUBLIC_BASE_URL);

  const url = [base, 'api', segment].join('/');

  if (process.env.TWILIO_API_EDGE) {
    return `${url}#e=${process.env.TWILIO_API_EDGE}`;
  } else {
    return url;
  }
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
