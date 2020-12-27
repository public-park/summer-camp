import React from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPhoneError, setPhoneToken } from '../../actions/PhoneAction';
import { ApplicationContext } from '../../context/ApplicationContext';
import { useFetchPhoneToken } from '../../hooks/useFetchPhoneToken';
import { useQueryStringParameter } from '../../hooks/useQueryStringParameter';
import { selectPhoneToken } from '../../store/Store';

export const PhonePreflight = (props: any) => {
  const { phone, user } = useContext(ApplicationContext);

  const current = useSelector(selectPhoneToken);

  const edge = useQueryStringParameter('edge');
  const { token, error } = useFetchPhoneToken(current, user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (current && phone) {
      console.log(`Phone device init with updated: ${current.substr(0, 10)}`);

      phone!.init(current, edge);
    }
  }, [current, phone, edge]);

  useEffect(() => {
    return () => {
      phone?.destroy();
    };
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(setPhoneError(new Error('Could not fetch new token, check your internet connection')));
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(setPhoneToken(token));
    }
  }, [token, dispatch]);

  return <>{props.children}</>;
};
