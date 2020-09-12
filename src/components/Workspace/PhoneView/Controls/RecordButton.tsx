import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectCall, Call } from '../../../../store/Store';
import { CallStatus } from '../../../../phone/Call';
import { CallNotFoundException } from '../../../../exceptions/CallNotFoundException';

export const RecordButton = () => {
  const { call } = useContext(ApplicationContext);
  const { status } = useSelector(selectCall) as Call;

  const [isRecording, setIsRecording] = useState(call?.isRecording ? true : false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleRecord = async () => {
    if (status !== CallStatus.InProgress) {
      return;
    }

    console.debug(`isRecording set to: ${!isRecording}`);

    setIsProcessing(true);
    setIsRecording(!isRecording);

    if (!call) {
      throw new CallNotFoundException();
    }

    await call.record(!isRecording);

    setIsProcessing(false);
  };

  const getButtonState = (status: CallStatus, isRecording: boolean) => {
    if (status !== CallStatus.InProgress) {
      return 'record-button-disabled';
    }

    if (isRecording) {
      return 'record-pause-button';
    }

    return 'record-button';
  };
  return (
    <button
      className={getButtonState(status, isRecording)}
      disabled={isProcessing}
      onClick={() => toggleRecord()}
    ></button>
  );
};
