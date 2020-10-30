import React from 'react';
import { LoadIndicator } from '../ConfigurationView/LoadIndicator';

export const Expired = () => {
  return (
    <div className="expired">
      <div className="status-text">Phone expired, fetching a new token ....</div>

      <LoadIndicator />
    </div>
  );
};
