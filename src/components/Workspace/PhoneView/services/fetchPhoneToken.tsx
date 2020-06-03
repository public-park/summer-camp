import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';
import { request } from '../../../../helpers/api/RequestHelper';

export const fetchPhoneToken = async (user: User) => {
  try {
    const response = await request(getUrl(`users/${user.id}/phone/token`))
      .withAuthentication(user)
      .post();

    return response.body.token;
  } catch (error) {
    throw error;
  }
};
