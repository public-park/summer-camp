import Typography from '@material-ui/core/Typography';
import React from 'react';

export const OutgoingDisabled = () => {
  return (
    <div style={{ padding: '10px', textAlign: 'center' }}>
      <Typography variant="body1" gutterBottom>
        You cannot initiate phone calls, outgoing connection is disabled by configuration.
      </Typography>
    </div>
  );
};
