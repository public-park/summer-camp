import React from 'react';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../store/Store';

export const IncomingCall = () => {
  const call = useSelector(selectCall);

  const answerCall = () => {
    if (call) {
      call.answer();
    }
  };

  return (
    <div className="incoming">
      <div className="display">
        <span className="duration">Incoming call from</span>

        <span className="phone-number">{call ? call.phoneNumber : '-'}</span>
      </div>

      <div className="blank"></div>

      <button className="accept-call-button" onClick={() => answerCall()}></button>
    </div>
  );
};
