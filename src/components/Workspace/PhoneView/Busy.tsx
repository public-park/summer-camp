import React, { useState } from 'react';

import { Keypad } from './Idle/Keypad';
import { MuteButton } from './Controls/MuteButton';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../store/Store';
import { useCallDuration } from './hooks/useCallDuration';
import { useCallDurationFormat } from './hooks/useCallDurationFormat';
import { HoldButton } from './Controls/HoldButton';

export const Busy = () => {
  const call = useSelector(selectCall);

  const [showKeypad, setShowKeypad] = useState(false);

  const duration = useCallDuration(call?.answeredAt);
  const durationFormatted = useCallDurationFormat(duration);

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

      <button onClick={() => endCall()} className="end-call-button"></button>
    </div>
  );
};
