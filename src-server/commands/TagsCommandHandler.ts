import { UserWithOnlineState } from '../pool/UserWithOnlineState';

const handle = async (user: UserWithOnlineState, tags: Array<string>) => {
  user.tags = new Set(tags);

  user.persist();

  return { tags: user.tags };
};

export const TagsCommandHandler = {
  handle,
};
