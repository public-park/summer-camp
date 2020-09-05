import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectCall, Call } from '../../../../store/Store';
import { CallStatus } from '../../../../phone/Call';
import { CallNotFoundException } from '../../../../exceptions/CallNotFoundException';

export const HoldButton = () => {
  const { call } = useContext(ApplicationContext);
  const { status } = useSelector(selectCall) as Call;

  const [isOnHold, setIsOnHold] = useState(call?.isOnHold ? true : false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleHold = async () => {
    if (status !== CallStatus.InProgress) {
      return;
    }

    console.debug(`isHold set to: ${!isOnHold}`);

    setIsProcessing(true);
    setIsOnHold(!isOnHold);

    if (!call) {
      throw new CallNotFoundException();
    }

    await call.hold(!isOnHold);

    setIsProcessing(false);
  };

  const getButtonState = (status: CallStatus, isOnHold: boolean) => {
    if (status !== CallStatus.InProgress) {
      return 'hold-button-disabled';
    }

    if (isOnHold) {
      return 'unhold-button';
    }

    return 'hold-button';
  };

  return (
    <button disabled={isProcessing} onClick={() => toggleHold()} className={getButtonState(status, isOnHold)}></button>
  );
};
