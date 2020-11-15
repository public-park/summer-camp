import { useEffect, useState } from 'react';
import { User } from '../models/User';
import { useSelector } from 'react-redux';
import { selectPhoneToken, selectConfiguration } from '../store/Store';
import { createPhoneToken } from '../services/RequestService';

export const useFetchPhoneToken = (user: User) => {
  const token = useSelector(selectPhoneToken);
  const configuration = useSelector(selectConfiguration);

  const [error, setError] = useState<Error | undefined>();
  const [localToken, setLocalToken] = useState<string>();

  useEffect(() => {
    const run = async () => {
      try {
        const token = await createPhoneToken(user);

        setLocalToken(token);
      } catch (error) {
        setError(error);
      }
    };

    if (!token && configuration) {
      run();
    }
  }, [token, configuration, user]);

  return { token: localToken, error };
};
