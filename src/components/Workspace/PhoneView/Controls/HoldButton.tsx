import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';

export const HoldButton = () => {
  const { call } = useContext(ApplicationContext);

  const [isOnHold, setIsOnHold] = useState(call?.isOnHold);

  const toggleHold = () => {
    const state: boolean = !isOnHold;

    console.log('isHold set to: ' + state);

    setIsOnHold(state);

    // TODO, if no call is found in status in-progress, disable button
    if (call) {
      call.hold(state);
    }
  };

  return <button onClick={() => toggleHold()} className={isOnHold ? 'unhold-button' : 'hold-button'}></button>;
};
