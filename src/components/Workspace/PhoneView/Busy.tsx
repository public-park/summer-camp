import React, { useState, useContext } from 'react';

import { Keypad } from './Idle/Keypad';
import { MuteButton } from './Controls/MuteButton';
import { useCallDuration } from './hooks/useCallDuration';
import { useCallDurationFormat } from './hooks/useCallDurationFormat';
import { HoldButton } from './Controls/HoldButton';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../store/Store';
import { RecordButton } from './Controls/RecordButton';
import { CallNotFoundException } from '../../../exceptions/CallNotFoundException';
import { CallDirection } from '../../../models/CallDirection';

export const Busy = () => {
  const { call } = useContext(ApplicationContext);

  const { from, to, direction, answeredAt } = useSelector(selectCall) || {};

  const [showKeypad, setShowKeypad] = useState(false);

  const duration = useCallDuration(answeredAt); // TODO, fix
  const durationFormatted = useCallDurationFormat(duration);

  const end = () => {
    if (!call) {
      throw new CallNotFoundException();
    }

    call.end();
  };

  return (
    <div className="call">
      <div className="display">
        <span className="duration">{durationFormatted}</span>

        <span className="phone-number">{direction === CallDirection.Inbound ? from : to}</span>
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

      <button onClick={() => end()} disabled={!call?.isConnected} className="end-call-button"></button>
    </div>
  );
};
