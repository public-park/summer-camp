import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../../store/Store';

export const MuteButton = () => {
  const [isMuted, setIsMuted] = useState(false);

  const call = useSelector(selectCall);

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
