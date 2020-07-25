import React, { useState, useEffect } from 'react';

export const Offline = () => {
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOfflineNotification(true);
    }, 2000);

    setTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return <div>{showOfflineNotification && <div className="error">You are offline!</div>}</div>;
};
