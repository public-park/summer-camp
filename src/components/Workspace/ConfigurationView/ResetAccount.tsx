import React, { useContext } from 'react';
import { PhoneConfigurationContext } from './PhoneConfigurationContext';
import Button from '@material-ui/core/Button';
import { Typography, Card, CardContent } from '@material-ui/core';

export const ResetAccount = () => {
  const { setView, isSaving } = useContext(PhoneConfigurationContext);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Setup
        </Typography>

        <Typography variant="body1" gutterBottom>
          Twilio basic setup is valid, do you want to reset it?
        </Typography>

        <Button
          style={{ width: '100%' }}
          disabled={isSaving}
          onClick={() => setView('BASIC_SETUP')}
          variant="contained"
          color="primary"
        >
          yes, re-configure
        </Button>
      </CardContent>
    </Card>
  );
};
