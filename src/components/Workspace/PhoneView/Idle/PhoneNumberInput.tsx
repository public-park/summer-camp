import React, { ChangeEvent } from 'react';
import { selectPhoneDisplay } from '../../../../store/Store';
import { useSelector, useDispatch } from 'react-redux';
import { updatePhoneDisplay } from '../../../../actions/PhoneAction';

export const PhoneNumberInput = () => {
  const phoneDisplay = useSelector(selectPhoneDisplay);

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
    dispatch(updatePhoneDisplay(phoneDisplay.value.substr(0, phoneDisplay.value.length - 1)));
  };

  return (
    <div className="display">
      <input
        placeholder="Enter phone number"
        onPaste={handlePaste}
        className="phone-number-input"
        onChange={(e) => handleChange(e)}
        type="text"
        value={phoneDisplay.value}
      />
      <button onClick={() => removeDigit()} className="remove-digit-button"></button>
    </div>
  );
};
