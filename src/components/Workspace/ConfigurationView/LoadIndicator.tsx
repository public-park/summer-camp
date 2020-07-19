import React from 'react';
import { CircularProgress } from '@material-ui/core';

export const LoadIndicator = () => {
  return (
    <div className="load-indicator">
      <CircularProgress />
    </div>
  );
};
