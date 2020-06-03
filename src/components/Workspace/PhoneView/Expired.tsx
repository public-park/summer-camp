import React from 'react';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';

export const Expired = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      Phone token expired, requesting a new token .... <LoadIndicator />
    </div>
  );
};
