import React, { ChangeEvent, useContext } from 'react';
import { PhoneContext } from '../context/PhoneContext';

export const PhoneNumberInput = () => {
  const { to, updateTo } = useContext(PhoneContext);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    to.value = e.target.value;

    updateTo(to.value);
  };

  const removeDigit = () => {
    console.log('remove digit');
    updateTo(to.value.substr(0, to.value.length - 1));
  };

  return (
    <div className="display">
      <input className="phone-number-input" onChange={(e) => handleChange(e)} type="text" value={to.value} />
      <button onClick={() => removeDigit()} className="remove-digit-button"></button>
    </div>
  );
};
