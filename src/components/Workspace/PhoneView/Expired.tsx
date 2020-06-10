import React from 'react';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';

export const Expired = () => {
  return (
    <div className="expired">
      Phone token expired, requesting a new token .... <LoadIndicator />
    </div>
  );
};
