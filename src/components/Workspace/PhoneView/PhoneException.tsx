import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

interface PhoneExceptionProps {
  text?: string;
}

export const PhoneException = (props: PhoneExceptionProps) => {
  return (
    <Alert severity="warning">
      <AlertTitle>Error</AlertTitle>
      {props.text}
    </Alert>
  );
};
