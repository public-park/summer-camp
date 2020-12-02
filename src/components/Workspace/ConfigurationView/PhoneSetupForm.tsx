import React, { useContext } from 'react';
import { AccountResetForm } from './AccountResetForm';
import { Button } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import { PhoneNumberConfigurationPanel } from './PhoneNumberConfigurationPanel';
import { useDispatch, useSelector } from 'react-redux';
import { selectSetupConfiguration, selectSetupIsSaving, selectSetupValidation } from '../../../store/Store';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { saveConfiguration, saveConfigurationComplete } from '../../../actions/SetupAction';
import { updateAccountConfiguration } from '../../../services/RequestService';
import { User } from '../../../models/User';

export const PhoneSetupForm = () => {
  const dispatch = useDispatch();

  const { user } = useContext(ApplicationContext);

  const { local } = useSelector(selectSetupValidation);
  const { twilio } = useSelector(selectSetupConfiguration);
  const isSaving = useSelector(selectSetupIsSaving);

  const save = async () => {
    dispatch(saveConfiguration());

    try {
      await updateAccountConfiguration(user as User, twilio);

      dispatch(saveConfigurationComplete());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <AccountResetForm />
      <PhoneNumberConfigurationPanel />

      <Button fullWidth variant="contained" onClick={save} disabled={!local.isValid || isSaving} color="primary">
        SAVE SETUP
      </Button>

      {isSaving && <LoadIndicator />}
    </div>
  );
};
