import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { selectPhoneState, selectPhoneError, selectConfiguration } from '../../../store/Store';
import { IncomingCall } from './IncomingCall';
import { Busy } from './Busy';
import { Idle } from './Idle/Idle';
import { Offline } from './Offline';
import { Expired } from './Expired';
import { PhoneException } from './PhoneException';

export const PhoneView = () => {
  const state = useSelector(selectPhoneState);
  const error = useSelector(selectPhoneError);
  const configuration = useSelector(selectConfiguration);

  const [] = useState(false);

  const getPhoneView = (): JSX.Element | undefined => {
    if (!configuration) {
      return <PhoneException text="the phone is not configured yet, please go to setup" />;
    }

    if (error) {
      return <PhoneException text={`The phone reported an error: ${error}`} />;
    }

    switch (state) {
      case 'RINGING':
        return <IncomingCall />;
      case 'BUSY':
        return <Busy />;
      case 'IDLE':
        return <Idle />;
      case 'OFFLINE':
        return <Offline />;
      case 'EXPIRED':
        return <Expired />;
    }
  };

  return <div className="phone">{getPhoneView()}</div>;
};
