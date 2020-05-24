import React from 'react';

export const UnmuteButton = (props: any) => {
  return (
    <div>
      <button onClick={() => props.toggleMute()}>{props.isMuted ? 'unmute' : 'mute'}</button>
    </div>
  );
};
