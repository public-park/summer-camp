import React, { useState, useContext, useEffect } from 'react';
import { Typography, CardContent, Card, FormControl, Button } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import { AccountSetupFormInput } from './AccountSetupFormInput';
import {
  IS_TWILIO_ACCOUNT_SID_REGEXP,
  IS_TWILIO_API_KEY_REGEXP,
  IS_TWILIO_API_SECRET_REGEXP,
} from '../../../Constants';
import Alert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { selectSetupConfiguration, selectSetupIsSaving, selectSetupValidation } from '../../../store/Store';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { updateTwilioAccount, validateConfigurationComplete } from '../../../actions/SetupAction';
import { updateAccountConfiguration, validateAccountConfiguration } from '../../../services/RequestService';
import { User } from '../../../models/User';

export const AccountSetupForm = () => {
  const dispatch = useDispatch();

  const { user } = useContext(ApplicationContext);

  const { twilio } = useSelector(selectSetupConfiguration);
  const { remote } = useSelector(selectSetupValidation);
  const isSaving = useSelector(selectSetupIsSaving);

  const [key, setKey] = useState(twilio.key || '');
  const [secret, setSecret] = useState(twilio.secret || '');
  const [accountSid, setAccountSid] = useState(twilio.accountSid || '');
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
    try {
      const result = await validateAccountConfiguration(user as User, {
        ...twilio,
        key: key,
        secret: secret,
        accountSid: accountSid,
      });

      if (!result.isValid) {
        dispatch(validateConfigurationComplete(result));
      } else {
        await updateAccountConfiguration(user as User, {
          ...twilio,
          key: key,
          secret: secret,
          accountSid: accountSid,
        });

        dispatch(updateTwilioAccount(accountSid, key, secret));
      }
    } catch (error) {
      console.log(error);
    }

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
        <Typography variant="body1" gutterBottom>
          This phone uses Twilio for WebRTC phone calls. You need an Twilio account to complete the setup. You can
          create an API key on the <a href="https://www.twilio.com/docs/iam/access-tokens">Twilio Console </a>.
        </Typography>
        <form style={{ paddingTop: '10px' }} noValidate autoComplete="off">
          <FormControl fullWidth>
            <AccountSetupFormInput
              id="api_key"
              label="API Key"
              type="text"
              default={key}
              validator={IS_TWILIO_API_KEY_REGEXP}
              onUpdate={setKey}
              onFocus={onFocus}
            />

            <AccountSetupFormInput
              id="api_secret"
              label="API Secret"
              type="password"
              default={secret}
              validator={IS_TWILIO_API_SECRET_REGEXP}
              onUpdate={setSecret}
              onFocus={onFocus}
            />

            <AccountSetupFormInput
              id="account_sid"
              label="AccountSid"
              type="text"
              default={accountSid}
              validator={IS_TWILIO_ACCOUNT_SID_REGEXP}
              onUpdate={setAccountSid}
              onFocus={onFocus}
            />
          </FormControl>
          <Button fullWidth disabled={!isValid || isSaving} onClick={save} variant="contained" color="primary">
            VALIDATE AND SAVE
          </Button>
          {isPristine && !remote.isValid && (
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
