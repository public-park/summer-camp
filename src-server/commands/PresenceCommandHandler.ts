import { UserWithOnlineState } from '../pool/UserWithOnlineState';

const handle = async (user: UserWithOnlineState) => {
  return user.call;
};

export const PresenceCommandHandler = {
  handle,
};
