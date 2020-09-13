import React, { useContext } from 'react';
import { Alert } from '@material-ui/lab';
import { LoadIndicator } from './LoadIndicator';
import { AccountSetupForm } from './AccountSetupForm';
import { PhoneSetupForm } from './PhoneSetupForm';
import { ConfiguratonViewState } from './ConfigurationViewState';
import { ConfigurationContext } from './ConfigurationContext';

const getPhoneView = (view: ConfiguratonViewState, exception: string | undefined) => {
  switch (view) {
    case 'FAILED':
      return (
        <Alert style={{ marginTop: '15px' }} variant="filled" severity="error">
          {exception}
        </Alert>
      );
    case 'FETCHING':
      return <LoadIndicator />;
    case 'VALIDATING':
      return <LoadIndicator />;
    case 'BASIC_SETUP':
      return <AccountSetupForm />;
    case 'PHONE_SETUP':
      return <PhoneSetupForm />;
  }
};

export const ConfigurationView = () => {
  const { getView, exception, localValidation } = useContext(ConfigurationContext);

  return (
    <div className="configuration">
      {getPhoneView(getView(), exception)}

      {getView() === 'PHONE_SETUP' && !localValidation.isValid ? (
        <Alert style={{ marginTop: '15px' }} variant="filled" severity="error">
          {localValidation.exception}
        </Alert>
      ) : (
        ''
      )}
    </div>
  );
};
