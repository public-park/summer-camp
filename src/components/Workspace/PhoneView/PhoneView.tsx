import React from 'react';

import { useSelector } from 'react-redux';
import { selectPhoneState, selectPhoneError, selectConfiguration } from '../../../store/Store';
import { IncomingCall } from './IncomingCall';
import { Busy } from './Busy';
import { Idle } from './Idle/Idle';
import { Offline } from './Offline';
import { Expired } from './Expired';
import { PhoneException } from './PhoneException';
import { PhoneState } from '../../../phone/PhoneState';
import { Connect } from './Connect';

export const PhoneView = () => {
  const state = useSelector(selectPhoneState);
  const error = useSelector(selectPhoneError);
  const configuration = useSelector(selectConfiguration);

  const getPhoneView = (): JSX.Element | undefined => {
    if (!configuration) {
      return <PhoneException text="The phone is not configured yet, please go to setup" />;
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
      case PhoneState.Connecting:
        return <Connect />;
    }
  };

  return <div className="phone">{getPhoneView()}</div>;
};
