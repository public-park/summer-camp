import { request } from '../../../../helpers/api/RequestHelper';
import { User } from '../../../../models/User';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';
import { getUrl } from '../../../../helpers/UrlHelper';
import { ValidationResult } from '../../../../store/SetupStore';

export const validateAccountConfiguration = async (
  user: User,
  configuration: AccountConfiguration
): Promise<ValidationResult> => {
  try {
    const response = await request(getUrl(`/accounts/${user.accountId}/configuration/validate`))
      .withAuthentication(user)
      .post(configuration);
    console.log(response);
    return { isValid: true, text: '' };
  } catch (error) {
    console.log(error);

    return { isValid: false, text: error.response.body.description };
  }
};
