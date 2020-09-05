import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { selectPhoneState, selectPhoneError, selectConfiguration } from '../../../store/Store';
import { IncomingCall } from './IncomingCall';
import { Busy } from './Busy';
import { Idle } from './Idle/Idle';
import { Offline } from './Offline';
import { Expired } from './Expired';
import { PhoneException } from './PhoneException';
import { PhoneState } from '../../../phone/PhoneState';

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
      case PhoneState.Ringing:
        return <IncomingCall />;
      case PhoneState.Busy:
        return <Busy />;
      case PhoneState.Idle:
        return <Idle />;
      case PhoneState.Offline:
        return <Offline />;
      case PhoneState.Expired:
        return <Expired />;
    }
  };

  return <div className="phone">{getPhoneView()}</div>;
};
