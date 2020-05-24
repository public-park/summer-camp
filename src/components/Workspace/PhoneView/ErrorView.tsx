import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

export const ErrorView = (props: any) => {
  return (
    <Alert severity="warning">
      <AlertTitle>Error</AlertTitle>
      Please check the JavaScript Console
    </Alert>
  );
};
