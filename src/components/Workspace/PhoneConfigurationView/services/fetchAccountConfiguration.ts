import { request } from '../../../../helpers/api/RequestHelper';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';
import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';

export const fetchAccountConfiguration = async (user: User): Promise<AccountConfiguration | undefined> => {
  const response = await request(getUrl(`/accounts/${user.accountId}/configuration`))
    .withAuthentication(user)
    .fetch();

  // TODO add error handling
  return response?.body as AccountConfiguration;
};
