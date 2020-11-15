import React, { useContext, useEffect } from 'react';
import { Alert } from '@material-ui/lab';
import { LoadIndicator } from './LoadIndicator';
import { AccountSetupForm } from './AccountSetupForm';
import { PhoneSetupForm } from './PhoneSetupForm';
import { useDispatch, useSelector } from 'react-redux';
import { selectSetupConfiguration, selectSetupValidation, selectSetupView } from '../../../store/Store';
import { SetupStore, SetupView, ValidationResult } from '../../../store/SetupStore';
import {
  validateConfigurationComplete,
  fetchConfiguration,
  fetchConfigurationComplete,
} from '../../../actions/SetupAction';
import { ApplicationContext } from '../../../context/ApplicationContext';

import { validateConfiguration } from '../../../actions/SetupAction';
import { fetchAccountConfiguration, validateAccountConfiguration } from '../../../services/RequestService';

const getPhoneView = (view: SetupView) => {
  switch (view) {
    case SetupView.FAILED:
      return (
        <Alert style={{ marginTop: '15px' }} variant="filled" severity="error">
          Could not fetch configuration...
        </Alert>
      );
    case SetupView.FETCH:
      return <LoadIndicator />;
    case SetupView.VALIDATE:
      return <LoadIndicator />;
    case SetupView.ACCOUNT_FORM:
      return <AccountSetupForm />;
    case SetupView.PHONE_NUMBER_FORM:
      return <PhoneSetupForm />;
  }
};

export const ConfigurationView = () => {
  const dispatch = useDispatch();

  const view = useSelector(selectSetupView);
  const { local } = useSelector(selectSetupValidation);
  const { user } = useContext(ApplicationContext);
  const configuration = useSelector(selectSetupConfiguration);

  useEffect(() => {
    async function validate() {
      dispatch(validateConfiguration());
      try {
        const result = await validateAccountConfiguration(user, configuration.twilio as any);

        dispatch(validateConfigurationComplete(result as ValidationResult));
      } catch (error) {
        console.error(error);
      }
    }

    if (view === SetupView.FETCH_COMPLETE) {
      validate();
    }
  }, [view, dispatch, user, configuration.twilio]);

  useEffect(() => {
    async function init() {
      dispatch(fetchConfiguration());

      try {
        const configuration = await fetchAccountConfiguration(user);

        dispatch(fetchConfigurationComplete(configuration as SetupStore['configuration']['twilio']));
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, [dispatch, user]);

  return (
    <div className="configuration">
      {getPhoneView(view)}

      {view === SetupView.PHONE_NUMBER_FORM && !local.isValid ? (
        <Alert style={{ marginTop: '15px' }} variant="filled" severity="error">
          {local.text}
        </Alert>
      ) : (
        ''
      )}
    </div>
  );
};
