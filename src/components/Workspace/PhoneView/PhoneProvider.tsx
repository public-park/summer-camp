import React, { useEffect, useState, useContext } from 'react';
import { PhoneContext } from './context/PhoneContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPhoneToken } from './services/fetchPhoneToken';
import { ActionType } from '../../../actions/ActionType';
import { UserConnectionState } from '../../../models/enums/UserConnectionState';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { selectPhoneToken, selectConnectionState, selectConfiguration, selectPhoneState } from '../../../store/Store';

export const PhoneProvider = (props: any) => {
  const dispatch = useDispatch();

  const [isFetching, setIsFetching] = useState(false);
  const phoneToken = useSelector(selectPhoneToken);
  const phoneState = useSelector(selectPhoneState);
  const connectionState = useSelector(selectConnectionState);

  const configuration = useSelector(selectConfiguration);

  const { phone, user } = useContext(ApplicationContext);

  const [to, setTo] = useState({ value: '', isValidPhoneNumber: false });

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
    if (phoneToken && (phoneState === 'OFFLINE' || phoneState === 'EXPIRED')) {
      console.log(`device init with token: ${phoneToken?.substr(0, 10)} state was:  ${phoneState}`);
      phone.init(phoneToken);
    }
  }, [phoneToken, phoneState]);

  useEffect(() => {
    const fetchToken = async () => {
      /* user is offline, do not fetch a new token, destroy phone instead */
      if (connectionState === UserConnectionState.Closed) {
        phone.destroy();
        return;
      }

      try {
        setIsFetching(true);

        const token = await fetchPhoneToken(user);

        dispatch({
          type: ActionType.PHONE_TOKEN_UPDATED,
          payload: { token: token },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!phoneToken && configuration) {
      fetchToken();
    }
  }, [phoneToken, configuration]);

  return (
    <PhoneContext.Provider
      value={{
        to: to,
        updateTo: updateTo,
        isFetching: isFetching,
      }}
    >
      {props.children}
    </PhoneContext.Provider>
  );
};
