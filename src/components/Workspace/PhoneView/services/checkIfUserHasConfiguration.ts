import { User } from '../../../../models/User';

import { getUrl } from '../../../../helpers/UrlHelper';
import { request } from '../../../../helpers/api/RequestHelper';

export const checkIfUserHasConfiguration = async (user: User) => {
  try {
    await request(getUrl(`users/${user.id}/configuration`))
      .withAuthentication(user)
      .fetch();

    return true;
  } catch (error) {
    if (error.response.status !== 404) {
      throw error;
    }

    return false;
  }
};
