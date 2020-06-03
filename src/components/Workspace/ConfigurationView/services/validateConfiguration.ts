import { request } from '../../../../helpers/api/RequestHelper';
import { User } from '../../../../models/User';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';
import { getUrl } from '../../../../helpers/UrlHelper';

interface ValidationResult {
  isValid: boolean;
  code?: string;
}

export const validateConfiguration = async (
  user: User,
  configuration: AccountConfiguration
): Promise<ValidationResult> => {
  try {
    const response = await request(getUrl(`/accounts/${user.accountId}/configuration/validate`))
      .withAuthentication(user)
      .post(configuration);

    console.log(response.body);
    return { isValid: true };
  } catch (error) {
    // TODO check timeout
    console.log(error.response.body);

    return { isValid: false, code: error.response.body.description };
  }
};
