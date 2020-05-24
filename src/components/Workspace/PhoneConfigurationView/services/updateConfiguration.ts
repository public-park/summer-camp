import { request } from '../../../../helpers/api/RequestHelper';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';
import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';

export const updateConfiguration = async (user: User, configuration: AccountConfiguration): Promise<void> => {
  const response = await request(getUrl(`/accounts/${user.accountId}/configuration`))
    .withAuthentication(user)
    .post(configuration);
  // TODO catch error
};
