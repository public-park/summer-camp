import React, { ChangeEvent, useContext } from 'react';
import { selectPhoneDisplay, selectPhoneDisplayValue } from '../../../../store/Store';
import { useSelector, useDispatch } from 'react-redux';
import { setPhoneDisplayValue } from '../../../../actions/PhoneAction';

export const PhoneNumberInput = () => {
  const phoneNumber = useSelector(selectPhoneDisplayValue);

  const dispatch = useDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setPhoneDisplayValue(e.target.value));
  };

  const removeDigit = () => {
    dispatch(setPhoneDisplayValue(phoneNumber.substr(0, phoneNumber.length - 1)));
  };

  return (
    <div className="display">
      <input className="phone-number-input" onChange={(e) => handleChange(e)} type="text" value={phoneNumber} />
      <button onClick={() => removeDigit()} className="remove-digit-button"></button>
    </div>
  );
};
