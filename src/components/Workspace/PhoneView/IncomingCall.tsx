import React, { useContext } from 'react';
import { ApplicationContext } from '../../../context/ApplicationContext';

export const IncomingCall = () => {
  const { call } = useContext(ApplicationContext);

  const answer = () => {
    // TODO handle frontend error
    call?.answer();
  };

  return (
    <div className="incoming">
      <div className="display">
        <span className="duration">Incoming call from</span>

        <span className="phone-number">{call ? call.phoneNumber : '-'}</span>
      </div>

      <div className="blank"></div>

      <button className="accept-call-button" onClick={() => answer()}></button>
    </div>
  );
};
