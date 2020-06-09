import { AccountConfiguration } from '../../../models/AccountConfiguration';

export const DefaultConfiguration: AccountConfiguration = {
  key: undefined,
  secret: undefined,
  accountSid: undefined,
  inbound: { isEnabled: false, phoneNumber: undefined },
  outbound: { isEnabled: false, mode: undefined, phoneNumber: undefined },
};
