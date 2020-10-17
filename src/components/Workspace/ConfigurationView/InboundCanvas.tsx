import React from 'react';
import { PhoneNumberSelect } from './PhoneNumberSelect';
import { selectSetupConfiguration, selectSetupPhoneNumbers } from '../../../store/Store';
import { useDispatch, useSelector } from 'react-redux';
import { updateTwilioInbound } from '../../../actions/SetupAction';

export const InboundCanvas = () => {
  const dispatch = useDispatch();

  const {
    twilio: { inbound },
  } = useSelector(selectSetupConfiguration);

  const phoneNumbers = useSelector(selectSetupPhoneNumbers);

  const setPhoneNumber = (phoneNumber: string) => {
    dispatch(updateTwilioInbound(inbound.isEnabled, phoneNumber));
  };

  return (
    <div className="inbound-canvas">
      <PhoneNumberSelect
        style={{ marginBottom: '15px 0px 15px 0px' }}
        key="phone-number-select-inbound"
        value={inbound.phoneNumber}
        items={phoneNumbers}
        setValue={setPhoneNumber}
      />
    </div>
  );
};
