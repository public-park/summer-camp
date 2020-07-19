import React, { useContext } from 'react';
import { Alert } from '@material-ui/lab';
import { LoadIndicator } from './LoadIndicator';
import { AccountSetupForm } from './AccountSetupForm';
import { PhoneSetupForm } from './PhoneSetupForm';
import { ConfiguratonViewState } from './ConfigurationViewState';
import { ConfigurationContext } from './ConfigurationContext';

const getPhoneView = (view: ConfiguratonViewState) => {
  switch (view) {
    case 'FAILED':
      return (
        <Alert style={{ marginTop: '15px' }} variant="filled" severity="error">
          Could not fetch configuration
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
    default:
      // TODO implement
      break;
  }
};

export const ConfigurationView = () => {
  const { getView, error } = useContext(ConfigurationContext);

  return (
    <div className="configuration">
      {getPhoneView(getView())}

      {getView() === 'PHONE_SETUP' && error ? (
        <Alert style={{ marginTop: '15px' }} variant="filled" severity="error">
          {error}
        </Alert>
      ) : (
        ''
      )}
    </div>
  );
};
