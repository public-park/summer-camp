import React, { useContext } from 'react';
import { PhoneContext } from '../PhoneContext';
import { ApplicationContext } from '../../../../context/ApplicationContext';

export const CallButton = () => {
  const { phone } = useContext(ApplicationContext);

  const { to } = useContext(PhoneContext);

  const startCall = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    phone.call(to.value);
  };

  return (
    <button onClick={(e) => startCall(e)} disabled={!to.isValidPhoneNumber} className="start-call-button"></button>
  );
};
