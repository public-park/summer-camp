import React from 'react';
import Button from '@material-ui/core/Button';
import { Typography, Card, CardContent } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { resetTwilioAccount } from '../../../actions/SetupAction';
import { selectSetupIsSaving } from '../../../store/Store';

export const AccountResetForm = () => {
  const dispatch = useDispatch();

  const isSaving = useSelector(selectSetupIsSaving);

  const reset = () => {
    dispatch(resetTwilioAccount());
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Setup
        </Typography>

        <Typography variant="body1" gutterBottom>
          Twilio basic setup is valid, do you want to reset it?
        </Typography>

        <Button style={{ width: '100%' }} disabled={isSaving} onClick={reset} variant="contained" color="primary">
          yes, re-configure
        </Button>
      </CardContent>
    </Card>
  );
};
