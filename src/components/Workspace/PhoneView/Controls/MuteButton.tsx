import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';

export const MuteButton = () => {
  const { call } = useContext(ApplicationContext);

  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const state: boolean = !isMuted;

    console.log('isMuted set to: ' + state);

    setIsMuted(state);

    if (call) {
      call.mute(state);
    }
  };

  return <button onClick={() => toggleMute()} className={isMuted ? 'unmute-button' : 'mute-button'}></button>;
};
