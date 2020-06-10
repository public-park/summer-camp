import React, { useEffect, useState } from 'react';

let durationInterval: NodeJS.Timeout | undefined = undefined;

export const useCallDuration = (answeredAt?: Date) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let tick: number = 0;

    if (answeredAt) {
      tick = Math.round((new Date().getTime() - answeredAt.getTime()) / 1000);
    }

    setDuration(tick);

    durationInterval = setInterval(() => {
      setDuration(tick++);
    }, 1000);

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, []);

  return duration;
};
