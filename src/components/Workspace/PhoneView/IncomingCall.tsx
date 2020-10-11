import React, { useContext } from 'react';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { CallNotFoundException } from '../../../exceptions/CallNotFoundException';

export const IncomingCall = () => {
  const { call } = useContext(ApplicationContext);

  const answer = () => {
    if (!call) {
      throw new CallNotFoundException();
    }

    call.answer();
  };

  return (
    <div className="incoming">
      <div className="display">
        <span className="duration">Incoming call from</span>

        <span className="phone-number">{call ? call.from : '-'}</span>
      </div>

      <div className="blank"></div>

      <button className="accept-call-button" onClick={() => answer()}></button>
    </div>
  );
};
