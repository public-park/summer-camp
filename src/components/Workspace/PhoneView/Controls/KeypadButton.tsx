import React from 'react';
import { useDispatch } from 'react-redux';
import { setPhoneOverlay } from '../../../../actions/PhoneAction';

export const KeypadButton = () => {
  const dispatch = useDispatch();

  const show = () => {
    dispatch(setPhoneOverlay(true));
  };

  return <button onClick={() => show()} className="keypad-button"></button>;
};
