import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { CallNotFoundException } from '../../../../exceptions/CallNotFoundException';

export const MuteButton = () => {
  const { call } = useContext(ApplicationContext);

  const [isMuted, setIsMuted] = useState(call?.isMuted ? true : false);

  const toggleMute = () => {
    console.debug(`isMuted set to: ${!isMuted}`);

    setIsMuted(!isMuted);

    if (!call) {
      throw new CallNotFoundException();
    }

    call.mute(!isMuted);
  };

  return <button onClick={() => toggleMute()} className={isMuted ? 'unmute-button' : 'mute-button'}></button>;
};
