import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../../store/Store';

export const HoldButton = () => {
  const [isOnHold, setIsOnHold] = useState(false);

  const call = useSelector(selectCall);

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
