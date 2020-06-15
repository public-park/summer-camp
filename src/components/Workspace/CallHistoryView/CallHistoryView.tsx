import React, { useEffect, useState, useContext } from 'react';
import { CallItem } from './CallItem';
import { request } from '../../../helpers/api/RequestHelper';
import { getUrl } from '../../../helpers/UrlHelper';
import { ApplicationContext } from '../../../context/ApplicationContext';

export const CallHistoryView = () => {
  const { user } = useContext(ApplicationContext);

  const [calls, setCalls] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await request(getUrl(`/users/${user.id}/calls`))
          .withAuthentication(user)
          .fetch();

        setCalls(response.body);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchCalls();
  }, []);

  return (
    <div className="history">
      {error}

      {calls.length === 0 && <div style={{ padding: '10px' }}>No calls recorded</div>}

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
