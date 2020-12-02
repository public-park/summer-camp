import React, { useContext, useRef } from 'react';
import { ApplicationContext } from '../../../../context/ApplicationContext';
import { useSelector } from 'react-redux';
import { selectPhoneDisplay } from '../../../../store/Store';
import { PhoneNotFoundException } from '../../../../exceptions/PhoneNotFoundException';

export const CallButton = () => {
  const { user, phone } = useContext(ApplicationContext);

  const phoneDisplay = useSelector(selectPhoneDisplay);

  const ref = useRef<HTMLButtonElement>(null);

  const initiate = async () => {
    if (ref.current) {
      ref.current.setAttribute('disabled', 'disabled');
    }

    try {
      if (!phone) {
        throw new PhoneNotFoundException();
      }

      await phone.connect(phoneDisplay.value);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      ref={ref}
      onClick={initiate}
      disabled={!phoneDisplay.isValidPhoneNumber || !user?.isOnline()}
      className="start-call-button"
    ></button>
  );
};
