import React from 'react';
import { LoadIndicator } from '../PhoneConfigurationView/LoadIndicator';

export const TokenExpiredView = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      Phone token expired, requesting a new token .... <LoadIndicator />
    </div>
  );
};
