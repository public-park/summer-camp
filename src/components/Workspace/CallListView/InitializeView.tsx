import React from 'react';
import { CircularProgress } from '@material-ui/core';

export const InititializeView = () => {
  return (
    <div style={{ padding: '10px', justifyContent: 'center', display: 'flex' }} className="is-loading">
      <CircularProgress />
    </div>
  );
};
