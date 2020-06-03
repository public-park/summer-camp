import React, { useEffect, useState } from 'react';

import { Keypad } from './Idle/Keypad';
import { MuteButton } from './Controls/MuteButton';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../store/Store';
import { useCallDuration } from './hooks/useCallDuration';

let durationInterval: NodeJS.Timeout | undefined = undefined;

export const InCall = () => {
  const call = useSelector(selectCall);

  const [duration, setDuration] = useState(0);
  const durationFormatted = useCallDuration(duration);

  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    let tick = 0;

    durationInterval = setInterval(() => {
      setDuration(tick++);
    }, 1000);

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, []);

  const endCall = () => {
    if (call) {
      call.end();
    }
  };

  return (
    <div className="call">
      <div className="display">
        <span className="duration">{durationFormatted}</span>

        <span className="phone-number">{call?.phoneNumber}</span>
      </div>

      <div className="control">
        <div>&nbsp; </div>
        <MuteButton />

        <button onClick={() => setShowKeypad(!showKeypad)} className="keypad-button"></button>
        <div>&nbsp;</div>
      </div>

      {showKeypad ? <Keypad /> : <div className="blank"></div>}

      <button onClick={() => endCall()} className="end-call-button"></button>
    </div>
  );
};
