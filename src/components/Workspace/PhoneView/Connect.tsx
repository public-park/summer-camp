import React from 'react';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';

interface ConnectProps {
  text: string;
}

export const Connect = (props: ConnectProps) => {
  return (
    <div className="connect">
      {props.text}
      <LoadIndicator />
    </div>
  );
};
