import React, { useContext } from 'react';
import { AccountResetForm } from './AccountResetForm';
import { Button } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import { PhoneNumberConfigurationPanel } from './PhoneNumberConfigurationPanel';
import { ConfigurationContext } from './ConfigurationContext';

export const PhoneSetupForm = () => {
  const { save, isSaving, isValid } = useContext(ConfigurationContext);

  return (
    <div>
      <AccountResetForm />
      <PhoneNumberConfigurationPanel />

      <Button fullWidth variant="contained" onClick={save} disabled={!isValid || isSaving} color="primary">
        SAVE SETUP
      </Button>

      {isSaving && <LoadIndicator />}
    </div>
  );
};
