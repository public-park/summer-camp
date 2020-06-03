import React, { useState, useEffect, useContext } from 'react';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';
import { PhoneContext } from './context/PhoneContext';

export const Offline = (props: any) => {
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const { isFetching } = useContext(PhoneContext);

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

  return (
    <div>
      {showOfflineNotification && (
        <div className="error-canvas" style={{ textAlign: 'center', marginTop: '10px' }}>
          You are offline! {isFetching && <LoadIndicator />}
        </div>
      )}
    </div>
  );
};
