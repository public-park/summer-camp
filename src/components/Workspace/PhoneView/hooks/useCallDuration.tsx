import { useEffect, useState } from 'react';

let durationInterval: NodeJS.Timeout | undefined = undefined;

export const useCallDuration = (answeredAt?: string) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!answeredAt) {
      return;
    }

    let tick: number = Math.round((new Date().getTime() - new Date(answeredAt).getTime()) / 1000);

    setDuration(tick);

    durationInterval = setInterval(() => {
      setDuration(tick++);
    }, 1000);

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [answeredAt]);

  return duration;
};
