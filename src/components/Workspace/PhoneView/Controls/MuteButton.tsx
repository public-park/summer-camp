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

  const getButtonState = (isConnected: boolean | undefined, isMuted: boolean | undefined) => {
    if (!isConnected) {
      return 'mute-button-disabled';
    }

    if (isMuted) {
      return ' unmute-button';
    } else {
      return ' mute-button';
    }
  };

  return <button onClick={() => toggleMute()} className={getButtonState(call?.isConnected, call?.isMuted)}></button>;
};
