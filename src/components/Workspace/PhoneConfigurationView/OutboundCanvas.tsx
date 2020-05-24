import React, { useContext } from 'react';
import { PhoneNumberSelect } from './PhoneNumberSelect';
import { PhoneConfigurationContext } from './PhoneConfigurationContext';
import { FormControlLabel, Radio } from '@material-ui/core';

export const OutboundCanvas = (props: any) => {
  const { callerIds, phoneNumbers } = props;

  const { configuration, isSaving, setMode, setOutboundPhoneNumber } = useContext(PhoneConfigurationContext);

  return (
    <div style={{ backgroundColor: '#f7f7f7', padding: '10px 10px 10px 35px' }}>
      <div>
        <FormControlLabel
          value="end"
          control={
            <Radio
              checked={configuration.outbound.mode === 'internal-caller-id'}
              color="primary"
              value="internal-caller-id"
              onChange={(event) => setMode(event.target.value)}
            />
          }
          label="Use a phone number"
        />
      </div>

      {configuration.outbound.mode === 'internal-caller-id' && (
        <PhoneNumberSelect
          key="phone-number-select-outbound"
          value={configuration.outbound.phoneNumber}
          items={phoneNumbers}
          setValue={setOutboundPhoneNumber}
        />
      )}

      <div>
        <FormControlLabel
          value="end"
          control={
            <Radio
              disabled={isSaving}
              checked={configuration.outbound.mode === 'external-caller-id'}
              color="primary"
              value="external-caller-id"
              onChange={(event) => setMode(event.target.value)}
            />
          }
          label="Use a verified caller ID"
        />
      </div>

      {configuration.outbound.mode === 'external-caller-id' ? (
        <PhoneNumberSelect
          key="caller-id-select-outbound"
          value={configuration.outbound.phoneNumber}
          items={callerIds}
          setValue={setOutboundPhoneNumber}
        />
      ) : (
        ''
      )}
    </div>
  );
};
