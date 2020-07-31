import React, { useContext, useState } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectPhoneDisplayIsValidPhoneNumber, selectPhoneDisplayValue } from '../../../../store/Store';

export const CallButton = () => {
  const [isFetching, setIsFetching] = useState(false);

  const isValid = useSelector(selectPhoneDisplayIsValidPhoneNumber);
  const phoneNumber = useSelector(selectPhoneDisplayValue);

  const { phone } = useContext(ApplicationContext);

  const startCall = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setIsFetching(true);

    try {
      await phone.call(phoneNumber);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <button onClick={(e) => startCall(e)} disabled={!isValid || isFetching} className="start-call-button"></button>
  );
};
