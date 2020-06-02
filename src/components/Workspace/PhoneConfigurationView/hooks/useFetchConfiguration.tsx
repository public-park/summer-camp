import React, { useState, useEffect } from 'react';
import { User } from '../../../../models/User';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';
import { fetchUserConfiguration } from '../services/fetchUserConfiguration';

export const useFetchConfiguration = (user: User) => {
  const [isFetching, setIsFetching] = useState(false);
  const [configuration, setConfiguration] = useState<AccountConfiguration | undefined>(undefined);

  useEffect(() => {
    async function init() {
      try {
        setIsFetching(true);

        const configuration = await fetchUserConfiguration(user);

        if (!configuration) {
          throw new Error('config is empty');
        }

        setConfiguration(configuration);
      } catch (error) {
        console.log(error);
        // TODO implement
      } finally {
        setIsFetching(false);
      }
    }

    init();
  }, []);

  return { isFetching, configuration };
};
