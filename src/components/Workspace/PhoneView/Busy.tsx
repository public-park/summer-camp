import React, { useState, useContext } from 'react';

import { Keypad } from './Idle/Keypad';
import { MuteButton } from './Controls/MuteButton';

import { useCallDuration } from './hooks/useCallDuration';
import { useCallDurationFormat } from './hooks/useCallDurationFormat';
import { HoldButton } from './Controls/HoldButton';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectCall, Call } from '../../../store/Store';
import { CallDirection } from '../../../phone/Call';
import { RecordButton } from './Controls/RecordButton';

export const Busy = () => {
  const { call } = useContext(ApplicationContext);

  const { from, to, direction } = useSelector(selectCall) as Call;

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

        {direction === CallDirection.Inbound && <span className="phone-number">{from}</span>}
        {direction === CallDirection.Outbound && <span className="phone-number">{to}</span>}
      </div>

      <div className="control">
        <div>
          <MuteButton />
        </div>
        <div>
          <HoldButton />
        </div>

        <div>
          <RecordButton />
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
