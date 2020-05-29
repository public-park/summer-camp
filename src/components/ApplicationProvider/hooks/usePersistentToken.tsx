import { useEffect, useState } from 'react';
import { selectToken } from '../../../store/Store';
import { useSelector } from 'react-redux';
import { request } from '../../../helpers/api/RequestHelper';
import { getUrl } from '../../../helpers/UrlHelper';

export const usePersistentToken = () => {
  const [persistentToken, setPersistentToken] = useState<string | undefined>(undefined);

  const token = useSelector(selectToken);
  const key = 'token';

  useEffect(() => {
    console.log(`get token from local browser storage`);

    const validateToken = async (token: string) => {
      const response = await request(getUrl(`/validate-token`)).post({ token: token });

      if (response.body.isValid) {
        setPersistentToken(token);
      }
    };

    if (!window.localStorage) {
      console.log(`browser has no local storage object, cannot load token`);
      return;
    }

    const token = window.localStorage.getItem(key);

    if (token) {
      console.log(`browser had a stored token ${token} validating against server`);
      validateToken(token);
    } else {
      console.log(`token not found`);
    }
  }, []);

  useEffect(() => {
    if (!window.localStorage) {
      console.log(`browser has no local storage object, cannot save token`);
      return;
    }

    if (token) {
      console.log(`persist token ${token} on local storage`);

      window.localStorage.setItem(key, token);
    } else {
      console.log(`remove token from local storage`);

      window.localStorage.removeItem(key);
    }
  }, [token]);

  return persistentToken;
};
