import React, { useEffect, useState, useContext } from 'react';
import { CallItem } from './CallItem';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';
import { fetchCalls } from '../../../services/RequestService';
import { CallDocument } from '../../../models/documents/CallDocument';
// TODO rename to CallList
export const CallHistoryView = () => {
  // TODO, add hook useFetchCallHistory(start, limit) => isFetching, calls

  const { user } = useContext(ApplicationContext);
  const [calls, setCalls] = useState<Array<CallDocument>>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setIsFetching(true);

        const calls = await fetchCalls(user!, 0, 50);

        setIsFetching(false);

        setCalls(calls);
      } catch (error) {
        setError(error.message);
      }
    };

    run();
  }, [user]);

  return (
    <div className="history">
      {error}

      {isFetching && <LoadIndicator />}

      {!isFetching && calls.length === 0 && <div style={{ padding: '10px' }}>No calls recorded</div>}

      {calls.map((call: CallDocument) => {
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
