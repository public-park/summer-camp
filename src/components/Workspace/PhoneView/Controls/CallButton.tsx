import React, { useContext } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectPhoneDisplayIsValidPhoneNumber, selectPhoneDisplayValue } from '../../../../store/Store';

export const CallButton = () => {
  const isValid = useSelector(selectPhoneDisplayIsValidPhoneNumber);
  const phoneNumber = useSelector(selectPhoneDisplayValue);

  const { phone } = useContext(ApplicationContext);

  const startCall = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    phone.call(phoneNumber);
  };

  return <button onClick={(e) => startCall(e)} disabled={!isValid} className="start-call-button"></button>;
};
