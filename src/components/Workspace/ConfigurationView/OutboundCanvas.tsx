import React from 'react';
import { PhoneNumberSelect } from './PhoneNumberSelect';
import { FormControlLabel, Radio } from '@material-ui/core';
import {
  selectSetupCallerIds,
  selectSetupConfiguration,
  selectSetupIsSaving,
  selectSetupPhoneNumbers,
} from '../../../store/Store';
import { useDispatch, useSelector } from 'react-redux';
import { updateTwilioOutbound } from '../../../actions/SetupAction';

export const OutboundCanvas = () => {
  const dispatch = useDispatch();

  const {
    twilio: { outbound },
  } = useSelector(selectSetupConfiguration);

  const isSaving = useSelector(selectSetupIsSaving);
  const phoneNumbers = useSelector(selectSetupPhoneNumbers);
  const callerIds = useSelector(selectSetupCallerIds);

  const setMode = (mode: 'internal-caller-id' | 'external-caller-id') => {
    dispatch(updateTwilioOutbound(outbound.isEnabled, mode, outbound.phoneNumber));
  };

  const setPhoneNumber = (phoneNumber: string) => {
    dispatch(updateTwilioOutbound(outbound.isEnabled, outbound.mode, phoneNumber));
  };

  return (
    <div className="outbound-canvas">
      <div>
        <FormControlLabel
          value="end"
          control={
            <Radio
              checked={outbound.mode === 'internal-caller-id'}
              color="primary"
              value="internal-caller-id"
              onChange={(event) => setMode(event.target.value as 'internal-caller-id' | 'external-caller-id')}
            />
          }
          label="Use a phone number"
        />
      </div>

      {outbound.mode === 'internal-caller-id' && (
        <PhoneNumberSelect
          key="phone-number-select-outbound"
          value={outbound.phoneNumber}
          items={phoneNumbers}
          setValue={setPhoneNumber}
        />
      )}

      <div>
        <FormControlLabel
          value="end"
          control={
            <Radio
              disabled={isSaving}
              checked={outbound.mode === 'external-caller-id'}
              color="primary"
              value="external-caller-id"
              onChange={(event) => setMode(event.target.value as 'internal-caller-id' | 'external-caller-id')}
            />
          }
          label="Use a verified caller ID"
        />
      </div>

      {outbound.mode === 'external-caller-id' ? (
        <PhoneNumberSelect
          key="caller-id-select-outbound"
          value={outbound.phoneNumber}
          items={callerIds}
          setValue={setPhoneNumber}
        />
      ) : (
        ''
      )}
    </div>
  );
};
