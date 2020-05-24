import React, { useEffect, useState } from 'react';

import { PhoneContext } from './PhoneContext';
import { PhoneState } from '../../../phone/PhoneController';
import { useDispatch, useSelector } from 'react-redux';
import { selectPhone, selectUser, selectPhoneToken, selectConnectionState } from '../../../store/Store';
import { checkIfUserHasConfiguration } from './services/checkIfUserHasConfiguration';
import { fetchPhoneToken } from './services/fetchPhoneToken';
import { ActionType } from '../../../actions/ActionType';
import { UserConnectionState } from '../../../models/enums/UserConnectionState';

export const PhoneContainer = (props: any) => {
  const dispatch = useDispatch();

  const [hasConfiguration, setHasConfiguration] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const phoneToken = useSelector(selectPhoneToken);

  const user = useSelector(selectUser);
  const phone = useSelector(selectPhone);
  const connectionState = useSelector(selectConnectionState);

  const [to, setTo] = useState({ value: '', isValidPhoneNumber: false });

  const [error, setError] = useState<Error | undefined>();

  const updateTo = (to: string) => {
    const isNumberExpression = /^\d+$/g;

    if (isNumberExpression.test(to)) {
      to = `+${to}`;
    }

    const isPhoneNumberExpression = /^\+\d+$/g;

    setTo({
      value: to,
      isValidPhoneNumber: isPhoneNumberExpression.test(to),
    });
  };

  useEffect(() => {
    phone.onStateChanged((state: PhoneState, ...params: any) => {
      if (state === 'ERROR') {
        setError(new Error(params[0]));
      }
    });

    phone.onError((error: Error) => {
      console.log(error);
    });

    return () => {
      console.log('DESTROY PHONE');
      phone.destroy();
    };
  }, []);

  useEffect(() => {
    if (phoneToken) {
      phone.init(phoneToken);
    }
  }, [phoneToken]);

  useEffect(() => {
    const fetchToken = async () => {
      /* user is offline, do not fetch a new token, destroy phone instead */
      if (connectionState === UserConnectionState.Closed) {
        phone.destroy();
        return;
      }

      try {
        setIsFetching(true);

        const hasConfiguration = await checkIfUserHasConfiguration(user);

        setHasConfiguration(hasConfiguration);

        if (!hasConfiguration) return;

        const token = await fetchPhoneToken(user);

        dispatch({
          type: ActionType.PHONE_TOKEN_UPDATED,
          payload: { token: token },
        });
      } catch (error) {
        console.error(error);

        setError(error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!phoneToken) fetchToken();
  }, [phoneToken]);

  return (
    <PhoneContext.Provider
      value={{
        to: to,
        updateTo: updateTo,
        isFetching: isFetching,
        error,
        hasConfiguration,
      }}
    >
      {props.children}
    </PhoneContext.Provider>
  );
};
