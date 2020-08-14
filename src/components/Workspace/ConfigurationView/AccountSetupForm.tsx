import React, { useState, useContext, useEffect } from 'react';

import { Typography, CardContent, Card, TextField, FormControl, Button } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { validateConfiguration } from './services/validateConfiguration';
import { ConfigurationContext } from './ConfigurationContext';
import { DefaultConfiguration } from './DefaultConfiguration';

export const AccountSetupForm = () => {
  const { user } = useContext(ApplicationContext);

  const { configuration, setView, saveBasic, isSaving, setBaseConfiguration } = useContext(ConfigurationContext);

  const [key, setKey] = useState(configuration.key);
  const [secret, setSecret] = useState(configuration.secret);
  const [accountSid, setAccountSid] = useState(configuration.accountSid);

  const [isLoading, setIsLoading] = useState(false);

  const [isValidatedByServer, setIsValidatedByServer] = useState(false);

  useEffect(() => {
    setIsValidatedByServer(false);
  }, [key, secret, accountSid]);

  const validate = async () => {
    setIsLoading(true);

    const configuration = {
      ...DefaultConfiguration,
      key: key,
      secret: secret,
      accountSid: accountSid,
    };

    try {
      const validationResult = await validateConfiguration(user, configuration);

      if (validationResult.isValid) {
        setIsValidatedByServer(true);

        setBaseConfiguration(key as string, secret as string, accountSid as string);
      }
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
    // TODO, error message missing
  };

  const saveBasicSetup = async () => {
    try {
      await saveBasic();

      setView('PHONE_SETUP');
    } catch (error) {
      setView('FAILED');
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Setup
        </Typography>

        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <FormControl fullWidth>
            <TextField
              style={{ marginBottom: '20px' }}
              fullWidth
              disabled={isLoading}
              type="text"
              autoComplete="off"
              value={key ? key : ''}
              onChange={(event) => setKey(event.target.value)}
              id="api_key"
              label="API Key"
            />

            <TextField
              style={{ marginBottom: '20px' }}
              fullWidth
              disabled={isLoading}
              type="password"
              autoComplete="off"
              value={secret ? secret : ''}
              onChange={(event) => setSecret(event.target.value)}
              id="api_secret"
              label="API Secret"
            />

            <TextField
              style={{ marginBottom: '20px' }}
              fullWidth
              disabled={isLoading}
              type="text"
              autoComplete="off"
              value={accountSid ? accountSid : ''}
              onChange={(event) => setAccountSid(event.target.value)}
              id="account_sid"
              label="AccountSid"
            />
          </FormControl>

          {isValidatedByServer ? (
            <Button
              fullWidth
              disabled={isLoading || isSaving}
              onClick={saveBasicSetup}
              variant="contained"
              color="primary"
            >
              SAVE CONFIGURATION
            </Button>
          ) : (
            <Button fullWidth disabled={isLoading || isSaving} onClick={validate} variant="contained" color="primary">
              VALIDATE CONFIGURATION
            </Button>
          )}
          {(isLoading || isSaving) && <LoadIndicator />}
        </form>
      </CardContent>
    </Card>
  );
};
