import React, { useContext } from 'react';

import { useSelector } from 'react-redux';
import { selectPhoneState, selectPhoneError, selectConfiguration } from '../../../store/Store';
import { PhoneContext } from './context/PhoneContext';
import { IncomingCall } from './IncomingCall';
import { InCall } from './InCall';
import { Idle } from './Idle/Idle';
import { Offline } from './Offline';
import { Expired } from './Expired';
import { Connect } from './Connect';
import { PhoneException } from './PhoneException';

export const PhoneView = () => {
  const phoneState = useSelector(selectPhoneState);
  const phoneError = useSelector(selectPhoneError);
  const configuration = useSelector(selectConfiguration);

  const { isFetching } = useContext(PhoneContext);

  const getPhoneView = (): JSX.Element => {
    if (!configuration) {
      return <PhoneException text="the phone is not configured yet, please go to setup" />;
    }

    if (phoneError) {
      return <PhoneException text={`The phone reported an error: ${phoneError}`} />;
    }

    if (isFetching) {
      return <Connect text="Fetching Token ..." />;
    }

    switch (phoneState) {
      case 'RINGING':
        return <IncomingCall />;
      case 'IN_CALL':
        return <InCall />;
      case 'IDLE':
        return <Idle />;
      case 'OFFLINE':
        return <Offline />;
      case 'EXPIRED':
        return <Expired />;
      case 'CONNECTING':
        return <Connect text="Connecting Phone ..." />;
      default:
        return <PhoneException text={phoneError} />;
    }
  };

  return <div className="phone">{getPhoneView()}</div>;
};
