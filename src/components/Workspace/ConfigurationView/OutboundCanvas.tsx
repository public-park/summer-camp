import React, { useContext } from 'react';
import { PhoneNumberSelect } from './PhoneNumberSelect';
import { ConfigurationContext } from './ConfigurationContext';
import { FormControlLabel, Radio } from '@material-ui/core';

export const OutboundCanvas = (props: any) => {
  const { callerIds, phoneNumbers } = props;

  const { configuration, isSaving, setMode, setOutboundPhoneNumber } = useContext(ConfigurationContext);

  return (
    <div className="outbound-canvas">
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
