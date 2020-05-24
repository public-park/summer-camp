import React from 'react';
import { LoadIndicator } from '../PhoneConfigurationView/LoadIndicator';

export const ConnectView = (props: any) => {
  return (
    <div className="error-canvas" style={{ textAlign: 'center', marginTop: '10px' }}>
      {props.text}
      <LoadIndicator />
    </div>
  );
};
