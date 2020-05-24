import React, { useContext } from 'react';
import { Alert } from '@material-ui/lab';
import { LoadIndicator } from './LoadIndicator';
import { AccountForm } from './AccountForm';
import { PhoneNumberForm } from './PhoneNumberForm';
import { PhoneConfigurationContext } from './PhoneConfigurationContext';
import { ConfiguratonViewState } from './ConfigurationViewState';

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
      return <AccountForm />;
    case 'PHONE_SETUP':
      return <PhoneNumberForm />;
    default:
      // TODO implement
      break;
  }
};

export const PhoneConfigurationView = () => {
  const { getView, error } = useContext(PhoneConfigurationContext);

  return (
    <div className="setup" style={{ backgroundColor: '#f7f7f7', flex: 'auto', padding: '10px' }}>
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
