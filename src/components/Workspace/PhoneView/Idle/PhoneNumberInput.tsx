import React, { ChangeEvent } from 'react';
import { selectPhoneDisplayValue } from '../../../../store/Store';
import { useSelector, useDispatch } from 'react-redux';
import { updatePhoneDisplay } from '../../../../actions/PhoneAction';

export const PhoneNumberInput = () => {
  const phoneNumber = useSelector(selectPhoneDisplayValue);

  const dispatch = useDispatch();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(updatePhoneDisplay(event.target.value));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (event.clipboardData) {
      const raw = event.clipboardData.getData('text/plain');
      const text = raw.replace(/[^0-9]/gm, '');

      document.execCommand('insertText', false, text); // TODO replace with an API that is not deprecated
    }
  };

  const removeDigit = () => {
    dispatch(updatePhoneDisplay(phoneNumber.substr(0, phoneNumber.length - 1)));
  };

  return (
    <div className="display">
      <input
        onPaste={handlePaste}
        className="phone-number-input"
        onChange={(e) => handleChange(e)}
        type="text"
        value={phoneNumber}
      />
      <button onClick={() => removeDigit()} className="remove-digit-button"></button>
    </div>
  );
};
