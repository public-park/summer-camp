import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectCallStatus } from '../../../../store/Store';
import { CallNotFoundException } from '../../../../exceptions/CallNotFoundException';
import { CallStatus } from '../../../../models/CallStatus';

export const HoldButton = () => {
  const { call } = useContext(ApplicationContext);
  const status = useSelector(selectCallStatus);

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

  const getButtonState = (status: CallStatus | undefined, isOnHold: boolean) => {
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
