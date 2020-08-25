import { useRequest } from './useRequest';
import { useEffect } from 'react';
import { getUrl } from '../helpers/UrlHelper';
import { User } from '../models/User';
import { create } from '../helpers/api/RequestHelper';
import { useSelector } from 'react-redux';
import { selectPhoneToken, selectConfiguration } from '../store/Store';

export const useFetchPhoneToken = (user: User) => {
  const token = useSelector(selectPhoneToken);
  const configuration = useSelector(selectConfiguration);

  const { response, exception, setRequest } = useRequest();

  useEffect(() => {
    const fetchToken = async () => {
      const url = getUrl(`users/${user.id}/phone/token`);

      setRequest(create(url).withAuthentication(user).post());
    };

    if (!token && configuration) {
      fetchToken();
    }
  }, [token, configuration]);

  return { token: response?.body.token, exception };
};
