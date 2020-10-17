import { request } from '../../../../helpers/api/RequestHelper';
import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';
import { PhoneNumber } from '../../../../store/SetupStore';

export const fetchPhoneNumbers = async (
  user: User
): Promise<{ callerIds: Array<PhoneNumber>; phoneNumbers: Array<PhoneNumber> }> => {
  const response = await request(getUrl(`/accounts/${user.accountId}/phone-numbers`))
    .withAuthentication(user)
    .fetch();

  return {
    callerIds: response.body.outgoingCallerIds as Array<PhoneNumber>,
    phoneNumbers: response.body.incomingPhoneNumbers as Array<PhoneNumber>,
  };
};
