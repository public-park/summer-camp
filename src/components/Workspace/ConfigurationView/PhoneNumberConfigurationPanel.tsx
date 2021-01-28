import React, { useContext, useEffect, useState } from 'react';
import { OutboundCanvas } from './OutboundCanvas';
import { InboundCanvas } from './InboundCanvas';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Typography, Card, CardContent } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import Alert from '@material-ui/lab/Alert';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  updatePhoneNumbers,
  updateTwilioInbound,
  updateTwilioOutbound,
  validateConfigurationLocal,
} from '../../../actions/SetupAction';
import {
  selectSetupCallerIds,
  selectSetupConfiguration,
  selectSetupIsSaving,
  selectSetupPhoneNumbers,
} from '../../../store/Store';
import { fetchAccountPhoneNumbers } from '../../../services/RequestService';

export const PhoneNumberConfigurationPanel = () => {
  const dispatch = useDispatch();

  const { user } = useContext(ApplicationContext);
  const phoneNumbers = useSelector(selectSetupPhoneNumbers);
  const callerIds = useSelector(selectSetupCallerIds);

  const {
    twilio: { inbound, outbound },
  } = useSelector(selectSetupConfiguration);

  const [isFetching, setIsFetching] = useState(false);

  const isSaving = useSelector(selectSetupIsSaving);

  const updateOutbound = (enable: boolean) => {
    dispatch(updateTwilioOutbound(enable, outbound.mode, outbound.phoneNumber));
  };

  const updateInbound = (enable: boolean) => {
    dispatch(updateTwilioInbound(enable, inbound.phoneNumber));
  };

  useEffect(() => {
    async function init() {
      try {
        setIsFetching(true);

        const body = await fetchAccountPhoneNumbers(user!);

        setIsFetching(false);

        dispatch(updatePhoneNumbers(body.outgoingCallerIds, body.incomingPhoneNumbers));
      } catch (error) {
        console.log(error);
      } finally {
        setIsFetching(false);
      }
    }

    init();
  }, [user, dispatch]);

  useEffect(() => {
    if (phoneNumbers.length === 0) {
      return;
    }

    if (!outbound.isEnabled && !inbound.isEnabled) {
      dispatch(validateConfigurationLocal(false, 'Either outbound or inbound has to be active'));
      return;
    }

    if (outbound.isEnabled) {
      if (!outbound.mode) {
        dispatch(validateConfigurationLocal(false, 'Please select mode via caller id or number'));
        return;
      }

      if (outbound.mode === 'internal-caller-id' && !outbound.phoneNumber) {
        dispatch(validateConfigurationLocal(false, 'Please select a phoneNumber for outbound'));
        return;
      }

      if (outbound.mode === 'external-caller-id' && !outbound.phoneNumber) {
        dispatch(validateConfigurationLocal(false, 'Please select a callerId for outbound'));
        return;
      }
    }

    if (inbound.isEnabled) {
      if (!inbound.phoneNumber) {
        dispatch(validateConfigurationLocal(false, 'Please select a phoneNumber for inbound'));
        return;
      }
    }

    dispatch(validateConfigurationLocal(true));
    return;
  }, [phoneNumbers, inbound, outbound, dispatch]);

  return (
    <Card className="phone-number-configuration-panel" variant="outlined">
      <CardContent>
        {isFetching ? (
          <LoadIndicator />
        ) : (
          <div>
            <Typography variant="h5" gutterBottom>
              Incoming
            </Typography>

            {phoneNumbers.length === 0 ? (
              <Alert severity="warning">You have no phone numbers on your account</Alert>
            ) : (
              <FormControlLabel
                value="end"
                control={
                  <Checkbox
                    disabled={isSaving}
                    checked={inbound.isEnabled}
                    color="primary"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateInbound(event.target.checked)}
                  />
                }
                label="Use Phone for Incoming Calls"
                labelPlacement="end"
              />
            )}

            {inbound.isEnabled && phoneNumbers.length > 0 && <InboundCanvas />}

            <Typography className="outbound-title" variant="h5" gutterBottom>
              Outgoing
            </Typography>

            <FormControlLabel
              value="end"
              control={
                <Checkbox
                  disabled={isSaving}
                  checked={outbound.isEnabled}
                  color="primary"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateOutbound(event.target.checked)}
                />
              }
              label="Use Phone for Outgoing Calls"
              labelPlacement="end"
            />

            {outbound.isEnabled && phoneNumbers.length === 0 && (
              <Alert severity="warning">You have no phone numbers on your account</Alert>
            )}

            {outbound.isEnabled && callerIds.length === 0 && (
              <Alert severity="warning">You have no verified callerIds on your account</Alert>
            )}

            {outbound.isEnabled && <OutboundCanvas />}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
