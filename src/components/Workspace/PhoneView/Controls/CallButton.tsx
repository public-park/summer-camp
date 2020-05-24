import React, { useContext } from 'react';
import { PhoneContext } from '../PhoneContext';

import { useSelector } from 'react-redux';
import { selectPhone } from '../../../../store/Store';

export const CallButton = () => {
  const phone = useSelector(selectPhone);

  const { to } = useContext(PhoneContext);

  const startCall = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    phone.call(to.value);
  };

  return (
    <button onClick={(e) => startCall(e)} disabled={!to.isValidPhoneNumber} className="start-call-button"></button>
  );
};
