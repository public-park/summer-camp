import { request } from '../../../../helpers/api/RequestHelper';
import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';
import { SetupStore } from '../../../../store/SetupStore';

export const fetchAccountConfiguration = async (
  user: User
): Promise<SetupStore['configuration']['twilio'] | undefined> => {
  const response = await request(getUrl(`/accounts/${user.accountId}/configuration`))
    .withAuthentication(user)
    .fetch();

  // TODO add error handling
  return response?.body as SetupStore['configuration']['twilio'];
};
