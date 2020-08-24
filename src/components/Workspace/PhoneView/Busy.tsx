import React, { useState, useContext } from 'react';

import { Keypad } from './Idle/Keypad';
import { MuteButton } from './Controls/MuteButton';

import { useCallDuration } from './hooks/useCallDuration';
import { useCallDurationFormat } from './hooks/useCallDurationFormat';
import { HoldButton } from './Controls/HoldButton';
import { ApplicationContext } from '../../../context/ApplicationContext';

export const Busy = () => {
  const { call } = useContext(ApplicationContext);

  const [showKeypad, setShowKeypad] = useState(false);

  const duration = useCallDuration(call?.answeredAt);
  const durationFormatted = useCallDurationFormat(duration);

  const end = () => {
    // TODO throw error
    call?.end();
  };

  return (
    <div className="call">
      <div className="display">
        <span className="duration">{durationFormatted}</span>
        <span className="phone-number">{call?.phoneNumber}</span>
      </div>

      <div className="control">
        <div>
          <MuteButton />
        </div>
        <div>
          <HoldButton />
        </div>
        <div>
          <button onClick={() => setShowKeypad(!showKeypad)} className="keypad-button"></button>
        </div>
      </div>

      {showKeypad ? <Keypad /> : <div className="blank"></div>}

      <button onClick={() => end()} className="end-call-button"></button>
    </div>
  );
};
