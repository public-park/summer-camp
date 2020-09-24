import React, { useState, useContext, useEffect } from 'react';

import { Typography, CardContent, Card, FormControl, Button } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import { ConfigurationContext } from './ConfigurationContext';
import { AccountSetupFormInput } from './AccountSetupFormInput';
import {
  IS_TWILIO_ACCOUNT_SID_REGEXP,
  IS_TWILIO_API_KEY_REGEXP,
  IS_TWILIO_API_SECRET_REGEXP,
} from '../../../Constants';
import Alert from '@material-ui/lab/Alert';

export const AccountSetupForm = () => {
  const { configuration, saveBaseConfiguration, isSaving, isValidBaseConfiguration } = useContext(ConfigurationContext);

  const [key, setKey] = useState(configuration.key || '');
  const [secret, setSecret] = useState(configuration.secret || '');
  const [accountSid, setAccountSid] = useState(configuration.accountSid || '');
  const [isPristine, setIsPristine] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (
      IS_TWILIO_API_KEY_REGEXP.test(key) &&
      IS_TWILIO_API_SECRET_REGEXP.test(secret) &&
      IS_TWILIO_ACCOUNT_SID_REGEXP.test(accountSid)
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [key, secret, accountSid]);

  const save = async () => {
    await saveBaseConfiguration(key, secret, accountSid);

    setIsPristine(true);
  };

  const onFocus = () => {
    setIsPristine(false);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Setup
        </Typography>

        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <FormControl fullWidth>
            <AccountSetupFormInput
              id="api_key"
              label="API Key"
              type="text"
              default={configuration.key || ''}
              validator={IS_TWILIO_API_KEY_REGEXP}
              onUpdate={setKey}
              onFocus={onFocus}
            />

            <AccountSetupFormInput
              id="api_secret"
              label="API Secret"
              type="password"
              default={configuration.secret || ''}
              validator={IS_TWILIO_API_SECRET_REGEXP}
              onUpdate={setSecret}
              onFocus={onFocus}
            />

            <AccountSetupFormInput
              id="account_sid"
              label="AccountSid"
              type="text"
              default={configuration.accountSid || ''}
              validator={IS_TWILIO_ACCOUNT_SID_REGEXP}
              onUpdate={setAccountSid}
              onFocus={onFocus}
            />
          </FormControl>
          <Button fullWidth disabled={!isValid || isSaving} onClick={save} variant="contained" color="primary">
            VALIDATE AND SAVE
          </Button>
          {isPristine && isValidBaseConfiguration === false && (
            <Alert style={{ marginTop: '10px' }} variant="filled" severity="error">
              Configuration could not be validated with Twilio, please check the provided configuration.
            </Alert>
          )}
          {isSaving && <LoadIndicator />}
        </form>
      </CardContent>
    </Card>
  );
};
