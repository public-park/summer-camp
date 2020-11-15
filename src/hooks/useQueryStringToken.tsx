import { useEffect, useState } from 'react';
import { validateUserToken } from '../services/RequestService';

export const useQueryStringToken = () => {
  const [queryStringToken, setQueryStringToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const run = async (token: string) => {
      if ((await validateUserToken(token)) === true) {
        setQueryStringToken(token);
      }
    };

    const params = new URLSearchParams(window.location.search);

    if (params.has('token')) {
      console.log(`found ${params.get('token')} on query string`);

      /* always remove tokens from url, it should never be bookmarked or shared */
      window.history.pushState('', 'Summe Camp', '/');

      run(params.get('token') as string);
    }
  }, []);

  return queryStringToken;
};
