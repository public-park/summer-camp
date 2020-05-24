import React, { useContext } from 'react';
import { PhoneContext } from './PhoneContext';
import { KeypadButton } from './Controls/KeypadButton';
import { useSelector } from 'react-redux';
import { selectCall } from '../../../store/Store';

const keys = [
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

export const Keypad = (props: any) => {
  // const { store:  {call} } = useContext(Context);
  const { to, updateTo } = useContext(PhoneContext);

  const call = useSelector(selectCall);

  const addDigit = (digit: string) => {
    if (call) {
      call.sendDigits(digit);
    } else {
      updateTo(to.value + digit);
    }

    console.log('add: ' + digit);
  };

  return (
    <div className="keypad">
      <div>
        {keys.map((item: any) => {
          return (
            <KeypadButton
              className="digit-button"
              key={`digit-button-${item.number}`}
              addDigit={addDigit}
              letter={item.letter}
              number={item.number}
            />
          );
        })}
      </div>
    </div>
  );
};
