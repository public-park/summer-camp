import { useEffect, useState } from 'react';
import { getUrl } from '../helpers/UrlHelper';
import { request } from '../helpers/api/RequestHelper';

export const useQueryStringToken = () => {
  const [queryStringToken, setQueryStringToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const validateToken = async (token: string) => {
      const response = await request(getUrl(`/validate-token`)).post({ token: token });
      console.log(response.body);
      if (response.body.isValid) {
        setQueryStringToken(token);
      }
    };

    const params = new URLSearchParams(window.location.search);

    if (params.has('token')) {
      console.log(`found ${params.get('token')} on query string`);

      /* always remove tokens from url, it should never be bookmarked or shared */
      window.history.pushState('', 'Summe Camp', '/');

      validateToken(params.get('token') as string);
    }
  }, []);

  return queryStringToken;
};
