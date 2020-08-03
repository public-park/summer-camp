import { useEffect, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { UserConnectionState } from '../models/enums/UserConnectionState';
import { selectConnectionState, selectToken } from '../store/Store';
import { ApplicationContext } from '../context/ApplicationContext';

const getNextDelay = (delay: number) => {
  const factor = 1.5;
  const max = 30000;

  let next = Math.floor(delay * factor) - (Math.floor(delay * factor) % 100);

  return next > max ? max : next;
};

export const useReconnectWebSocket = () => {
  const { user } = useContext(ApplicationContext);

  const state = useSelector(selectConnectionState);
  const token = useSelector(selectToken);

  const [delay, setDelay] = useState<number>(1000);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | undefined>();

  const start = (next: number) => {
    setDelay(next);

    return setTimeout(() => {
      setAttempts(attempts + 1);

      if (user.connection.url && user.token) {
        console.log(`attempt ${attempts}, reconnect after ${next / 1000} seconds`);
        user.login(user.connection.url, user.token);
      }
    }, next);
  };

  useEffect(() => {
    if (token && attempts > 0) {
      let next = getNextDelay(delay);

      console.log(`start a new timer with ${next / 1000} seconds`);

      setTimer(start(next));
    }
  }, [attempts]);

  useEffect(() => {
    if (token && state === UserConnectionState.Closed && attempts === 0) {
      console.log(`start a new timer with 1 second`);
      setTimer(start(1000));
    }

    if (state === UserConnectionState.Open) {
      if (timer) {
        clearTimeout(timer);
      }

      setTimer(undefined);
      setAttempts(0);
    }
  }, [state, token]);

  return { timer, attempts, delay };
};
