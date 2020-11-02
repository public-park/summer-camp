import { useEffect, useState } from 'react';

let lastCheckInSeconds: number;
const intervalInSeconds: number = 15;
const gracePeriodInSeconds: number = 4;

export const usePageLifecycle = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isResume, setIsResume] = useState(false);

  const updateBrowserOnlineState = (event: Event) => {
    const state = navigator.onLine ? 'online' : 'offline';

    console.log('Browser Event: ' + event.type + '; state: ' + state);

    setIsOnline(state === 'online');
  };

  const getMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  useEffect(() => {
    window.addEventListener('online', updateBrowserOnlineState);
    window.addEventListener('offline', updateBrowserOnlineState);

    const getTimeInSeconds = () => {
      return Math.floor(new Date().getTime() / 1000);
    };

    const checkIfResume = (lastCheckInSeconds: number) => {
      if (getTimeInSeconds() > lastCheckInSeconds + intervalInSeconds + gracePeriodInSeconds) {
        return true;
      } else {
        return false;
      }
    };

    setInterval(function () {
      if (checkIfResume(lastCheckInSeconds)) {
        const elapsedInSeconds = getTimeInSeconds() - lastCheckInSeconds;

        console.log(
          `resume, time shift is ${getMinutes(elapsedInSeconds)} minute(s), ${
            elapsedInSeconds - getMinutes(elapsedInSeconds) * 60
          } second(s)`
        );

        setIsResume(true);
      } else {
        setIsResume(false);
      }

      lastCheckInSeconds = getTimeInSeconds();
    }, intervalInSeconds * 1000);
  }, []);

  return { isResume, isOnline };
};
