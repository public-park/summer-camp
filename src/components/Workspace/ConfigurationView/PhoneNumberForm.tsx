import React, { useContext } from 'react';
import { PhoneConfigurationContext } from './PhoneConfigurationContext';
import { ResetAccount } from './ResetAccount';
import { PhoneNumberConfiguration } from './PhoneNumberConfiguration';
import { Button } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';

export const PhoneNumberForm = () => {
  const { save, isSaving, isValid } = useContext(PhoneConfigurationContext);

  return (
    <div>
      <ResetAccount />
      <PhoneNumberConfiguration />

      <Button fullWidth variant="contained" onClick={save} disabled={!isValid || isSaving} color="primary">
        SAVE SETUP
      </Button>

      {isSaving && <LoadIndicator />}
    </div>
  );
};
