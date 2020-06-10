import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import { Typography, Card, CardContent } from '@material-ui/core';
import { ConfigurationContext } from './ConfigurationContext';

export const AccountResetForm = () => {
  const { setView, isSaving } = useContext(ConfigurationContext);

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