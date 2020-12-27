import { useEffect, useState } from 'react';
import { User } from '../models/User';
import { fetchPhoneToken } from '../services/RequestService';

export const useFetchPhoneToken = (current: string | undefined, user: User | undefined) => {
  const [error, setError] = useState<Error | undefined>();
  const [token, setToken] = useState<string>();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      setIsFetching(true);

      try {
        const token = await fetchPhoneToken(user!);

        setToken(token);
      } catch (error) {
        setError(error);
      } finally {
        setIsFetching(false);
      }
    };
    if (!current && !isFetching && user && user.configuration) {
      console.debug('fetch phone token');

      fetchToken();
    }
  }, [current, user]);

  return { token, error, isFetching };
};
