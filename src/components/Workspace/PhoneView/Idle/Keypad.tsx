import React, { useContext } from 'react';
import { KeypadButton } from './KeypadButton';
import { useSelector, useDispatch } from 'react-redux';
import { selectPhoneDisplay } from '../../../../store/Store';
import { updatePhoneDisplay } from '../../../../actions/PhoneAction';
import { ApplicationContext } from '../../../../context/ApplicationContext';

interface KeypadButtonProp {
  number: string;
  letters: string | null;
}

const keys: Array<KeypadButtonProp> = [
  { number: '1', letters: null },
  { number: '2', letters: 'ABC' },
  { number: '3', letters: 'DEF' },
  { number: '4', letters: 'GHI' },
  { number: '5', letters: 'JKL' },
  { number: '6', letters: 'MNO' },
  { number: '7', letters: 'PQRS' },
  { number: '8', letters: 'TUV' },
  { number: '9', letters: 'WXYZ' },
  { number: '*', letters: null },
  { number: '0', letters: null },
  { number: '#', letters: null },
];

export const Keypad = () => {
  const { call } = useContext(ApplicationContext);

  const phoneDisplay = useSelector(selectPhoneDisplay);

  const dispatch = useDispatch();

  // TODO add logic to separate component
  const addDigit = (digit: string) => {
    if (call) {
      call.sendDigits(digit);
    } else {
      dispatch(updatePhoneDisplay(phoneDisplay.value + digit));
    }

    console.log('add: ' + digit);
  };

  return (
    <div className="keypad">
      <div>
        {keys.map((item: KeypadButtonProp) => {
          return (
            <KeypadButton
              key={`digit-button-${item.number}`}
              addDigit={addDigit}
              letter={item.letters || ''}
              number={item.number}
            />
          );
        })}
      </div>
    </div>
  );
};
