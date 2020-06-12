import React, { useContext, useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import {
  selectPhoneState,
  selectPhoneError,
  selectConfiguration,
  selectConnectionState,
  selectPhoneToken,
} from '../../../store/Store';
import { IncomingCall } from './IncomingCall';
import { InCall } from './InCall';
import { Idle } from './Idle/Idle';
import { Offline } from './Offline';
import { Expired } from './Expired';
import { Connect } from './Connect';
import { PhoneException } from './PhoneException';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { UserConnectionState } from '../../../models/enums/UserConnectionState';
import { fetchPhoneToken } from './services/fetchPhoneToken';
import { setPhoneToken, setPhoneConfiguration } from '../../../actions/PhoneAction';

export const PhoneView = () => {
  const phoneState = useSelector(selectPhoneState);
  const phoneError = useSelector(selectPhoneError);
  const phoneToken = useSelector(selectPhoneToken);
  const configuration = useSelector(selectConfiguration);
  const connectionState = useSelector(selectConnectionState);

  const dispatch = useDispatch();

  const [isFetching, setIsFetching] = useState(false);

  const { phone, user } = useContext(ApplicationContext);

  useEffect(() => {
    if (phoneToken && ['OFFLINE', 'EXPIRED'].includes(phoneState)) {
      console.log(`device init with token: ${phoneToken?.substr(0, 10)} state was:  ${phoneState}`);
      phone.init(phoneToken);
    }
  }, [phoneToken, phoneState]);

  useEffect(() => {
    const initiate = async () => {
      /* user is offline, do not fetch a new token, destroy phone instead */
      if (connectionState === UserConnectionState.Closed) {
        phone.destroy();
        return;
      }

      try {
        setIsFetching(true);

        const token = await fetchPhoneToken(user);

        dispatch(setPhoneToken(token));
      } catch (error) {
        // TODO, if fetch failed set error instead of reset the configuration
        dispatch(setPhoneConfiguration());
      } finally {
        setIsFetching(false);
      }
    };

    if (!phoneToken && configuration) {
      initiate();
    }
  }, [phoneToken, configuration]);

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
