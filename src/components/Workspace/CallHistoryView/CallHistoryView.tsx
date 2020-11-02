import React, { useEffect, useState, useContext } from 'react';
import { CallItem } from './CallItem';
import { request } from '../../../helpers/api/RequestHelper';
import { getUrl } from '../../../helpers/UrlHelper';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';

export const CallHistoryView = () => {
  // TODO, add hook useFetchCallHistory(start, limit) => isFetching, calls

  const { user } = useContext(ApplicationContext);
  const [calls, setCalls] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setIsFetching(true);

        const response = await request(getUrl(`/calls`)).withAuthentication(user).fetch();

        setIsFetching(false);

        setCalls(response.body);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchCalls();
  }, [user]);

  return (
    <div className="history">
      {error}

      {isFetching && <LoadIndicator />}

      {!isFetching && calls.length === 0 && <div style={{ padding: '10px' }}>No calls recorded</div>}

      {calls.map((call: any) => {
        return (
          <CallItem
            to={call.to}
            from={call.from}
            duration={call.duration}
            direction={call.direction}
            createdAt={call.createdAt}
            status={call.status}
            key={call.id}
          />
        );
      })}
    </div>
  );
};
