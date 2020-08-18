import { UserWithOnlineState } from '../pool/UserWithOnlineState';

const handle = async (user: UserWithOnlineState) => {
  return { configuration: user.getConfiguration() };
};

export const ConfigurationCommandHandler = {
  handle,
};
