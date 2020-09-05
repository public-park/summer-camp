import React, { useContext, useState, useRef } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectPhoneDisplayIsValidPhoneNumber, selectPhoneDisplayValue } from '../../../../store/Store';
import { PhoneNotReadyException } from '../../../../exceptions/PhoneNotReadyException';

export const CallButton = () => {
  const isValid = useSelector(selectPhoneDisplayIsValidPhoneNumber);
  const phoneNumber = useSelector(selectPhoneDisplayValue);

  const ref = useRef<HTMLButtonElement>(null);

  const { phone } = useContext(ApplicationContext);

  const initiate = async () => {
    if (ref.current) {
      ref.current.setAttribute('disabled', 'disabled');
    }

    try {
      if (!phone) {
        throw new PhoneNotReadyException();
      }

      await phone.connect(phoneNumber);
    } catch (error) {
      console.log(error);
    }
  };

  return <button ref={ref} onClick={initiate} disabled={!isValid} className="start-call-button"></button>;
};
