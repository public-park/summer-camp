import React, { useContext } from 'react';
import { OutboundCanvas } from './OutboundCanvas';
import { InboundCanvas } from './InboundCanvas';
import { PhoneConfigurationContext } from './PhoneConfigurationContext';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Typography, Card, CardContent } from '@material-ui/core';
import { LoadIndicator } from './LoadIndicator';
import Alert from '@material-ui/lab/Alert';
import { useFetchPhoneNumbers } from './hooks/useFetchPhoneNumbers';
import { ApplicationContext } from '../../../context/ApplicationContext';

export const PhoneNumberConfiguration = () => {
  const { user } = useContext(ApplicationContext); // TODO useUser()

  const { configuration, isSaving, enableInbound, disableInbound, enableOutbound, disableOutbound } = useContext(
    PhoneConfigurationContext
  );

  const { isFetching, callerIds, phoneNumbers } = useFetchPhoneNumbers(user);

  const toggleInbound = (enable: boolean) => {
    if (enable) {
      enableInbound();
    } else {
      disableInbound();
    }
  };

  const toggleOutbound = (enable: boolean) => {
    if (enable) {
      enableOutbound();
    } else {
      disableOutbound();
    }
  };

  return (
    <Card style={{ marginBottom: '10px', marginTop: '10px' }} variant="outlined">
      <CardContent>
        {isFetching ? (
          <LoadIndicator />
        ) : (
          <div>
            <Typography variant="h5" gutterBottom>
              Inbound
            </Typography>

            {phoneNumbers.length === 0 ? (
              <Alert severity="warning">You have no phone numbers on your account</Alert>
            ) : (
              <FormControlLabel
                value="end"
                control={
                  <Checkbox
                    disabled={isSaving}
                    checked={configuration.inbound.isEnabled}
                    color="primary"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => toggleInbound(event.target.checked)}
                  />
                }
                label="Use Phone for Inbound"
                labelPlacement="end"
              />
            )}

            {configuration.inbound.isEnabled && phoneNumbers.length > 0 && (
              <InboundCanvas phoneNumbers={phoneNumbers} />
            )}

            <Typography style={{ marginTop: '10px' }} variant="h5" gutterBottom>
              Outbound
            </Typography>

            <FormControlLabel
              value="end"
              control={
                <Checkbox
                  disabled={isSaving}
                  checked={configuration.outbound.isEnabled}
                  color="primary"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => toggleOutbound(event.target.checked)}
                />
              }
              label="Use Phone for Inbound"
              labelPlacement="end"
            />

            {configuration.outbound.isEnabled && phoneNumbers.length === 0 && (
              <Alert severity="warning">You have no phone numbers on your account</Alert>
            )}

            {configuration.outbound.isEnabled && phoneNumbers.length === 0 && (
              <Alert severity="warning">You have no verified callerIds on your account</Alert>
            )}

            {configuration.outbound.isEnabled && <OutboundCanvas callerIds={callerIds} phoneNumbers={phoneNumbers} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
