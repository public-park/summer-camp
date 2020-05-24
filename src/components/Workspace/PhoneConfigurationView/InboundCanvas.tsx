import React, { useContext } from 'react';
import { PhoneNumberSelect } from './PhoneNumberSelect';
import { PhoneConfigurationContext } from './PhoneConfigurationContext';

export const InboundCanvas = (props: any) => {
  const { configuration, setInboundPhoneNumber } = useContext(PhoneConfigurationContext);

  return (
    <div style={{ backgroundColor: '#f7f7f7', marginBottom: '10px', padding: '10px 10px 10px 35px' }}>
      <PhoneNumberSelect
        style={{ marginBottom: '15px 0px 15px 0px' }}
        key="phone-number-select-inbound"
        value={configuration.inbound.phoneNumber}
        items={props.phoneNumbers}
        setValue={setInboundPhoneNumber}
      />
    </div>
  );
};
