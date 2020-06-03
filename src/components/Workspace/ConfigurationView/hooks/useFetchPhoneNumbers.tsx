import { useState, useEffect } from 'react';

import { User } from '../../../../models/User';
import { getUrl } from '../../../../helpers/UrlHelper';
import { request } from '../../../../helpers/api/RequestHelper';

export const useFetchPhoneNumbers = (user: User) => {
  const [isFetching, setIsFetching] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([{}]);
  const [callerIds, setCallerIds] = useState([{}]);

  useEffect(() => {
    async function init() {
      try {
        setIsFetching(true);

        const res = await request(getUrl(`/accounts/${user.accountId}/phone-numbers`))
          .withAuthentication(user)
          .fetch();

        setPhoneNumbers(res.body.incomingPhoneNumbers);
        setCallerIds(res.body.outgoingCallerIds);
      } catch (error) {
        console.log(error);
        // TODO implement
      } finally {
        setIsFetching(false);
      }
    }

    init();
  }, [user]);

  return { isFetching, callerIds, phoneNumbers };
};
