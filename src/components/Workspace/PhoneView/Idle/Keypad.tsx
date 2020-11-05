import React, { useContext } from 'react';
import { KeypadButton } from './KeypadButton';
import { useSelector, useDispatch } from 'react-redux';
import { selectPhoneDisplay } from '../../../../store/Store';
import { updatePhoneDisplay } from '../../../../actions/PhoneAction';
import { ApplicationContext } from '../../../../context/ApplicationContext';

interface KeypadButtonProp {
  identifier: string;
  number: string;
  letters: string | null;
}

const keys: Array<KeypadButtonProp> = [
  { identifier: '1', number: '1', letters: null },
  { identifier: '2', number: '2', letters: 'ABC' },
  { identifier: '3', number: '3', letters: 'DEF' },
  { identifier: '4', number: '4', letters: 'GHI' },
  { identifier: '5', number: '5', letters: 'JKL' },
  { identifier: '6', number: '6', letters: 'MNO' },
  { identifier: '7', number: '7', letters: 'PQRS' },
  { identifier: '8', number: '8', letters: 'TUV' },
  { identifier: '9', number: '9', letters: 'WXYZ' },
  { identifier: 'star', number: '*', letters: null },
  { identifier: '0', number: '0', letters: null },
  { identifier: 'hash', number: '#', letters: null },
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
              identifier={item.identifier}
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
