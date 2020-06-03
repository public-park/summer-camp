import React from 'react';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';

interface ConnectProps {
  text: string;
}

export const Connect = (props: ConnectProps) => {
  return (
    <div className="error-canvas" style={{ textAlign: 'center', marginTop: '10px' }}>
      {props.text}
      <LoadIndicator />
    </div>
  );
};
