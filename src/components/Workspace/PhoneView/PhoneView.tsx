import React, { useContext } from 'react';

import { KeypadCanvas } from './KeypadCanvas';
import { IncomingCallView } from './IncomingCallView';
import { InCallView } from './InCallView';
import { PhoneState } from '../../../phone/PhoneController';
import { OfflineNotification } from './OfflineNotification';
import { ErrorView } from './ErrorView';
import { TokenExpiredView } from './TokenExpiredView';
import { ConnectView } from './ConnectView';
import { PhoneContext } from './PhoneContext';
import { useSelector } from 'react-redux';
import { selectPhoneState, selectConfiguration } from '../../../store/Store';

export const PhoneView = () => {
  const phoneState = useSelector(selectPhoneState);
  const configuration = useSelector(selectConfiguration);

  const { error, isFetching } = useContext(PhoneContext);

  const getView = (state: PhoneState | string): JSX.Element => {
    switch (state) {
      case 'RINGING':
        return <IncomingCallView />;
      case 'IN_CALL':
        return <InCallView />;
      case 'IDLE':
        return <KeypadCanvas />;
      case 'OFFLINE':
        return <OfflineNotification />;
      case 'TOKEN_EXPIRED':
        return <TokenExpiredView />;
      case 'CONNECTING':
        return <ConnectView text="Connecting Phone ..." />;
      default:
        return <ErrorView errorText="{errorText}" />;
    }
  };

  if (!configuration) {
    return <div style={{ padding: '25px' }}>the phone is not configured yet, please go to setup</div>;
  }

  if (error) {
    return <div style={{ padding: '25px' }}>The phone reported an error: {error.message}</div>;
  }

  if (isFetching) {
    return <ConnectView text="Fetching Token ..." />;
  }
  return getView(phoneState);
};
