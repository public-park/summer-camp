import { request } from '../../../../helpers/api/RequestHelper';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';
import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';

export const saveAccountConfiguration = async (user: User, configuration: AccountConfiguration): Promise<void> => {
  await request(getUrl(`/accounts/${user.accountId}/configuration`))
    .withAuthentication(user)
    .post(configuration);
};
