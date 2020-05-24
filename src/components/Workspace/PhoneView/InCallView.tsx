import React, { useEffect, useState } from 'react';
import { MuteButton } from './Controls/MuteButton';
import { useCallDuration } from './hooks/useCallDuration';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../store/Store';
import { Keypad } from './Keypad';

let durationInterval: NodeJS.Timeout | null = null;

export const InCallView = (props: any) => {
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

      <button
        onClick={() => {
          console.log('end call', call);
          call?.end();
        }}
        className="end-call-button"
      ></button>
    </div>
  );
};
