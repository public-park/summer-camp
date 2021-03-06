import React from 'react';

interface KeypadButtonProps {
  addDigit: (digit: string) => void;
  identifier: string;
  number: string;
  letter: string;
}

export const KeypadButton = (props: KeypadButtonProps) => {
  return (
    <button
      onClick={() => props.addDigit(props.number)}
      className={`digit-button key-${props.identifier}`}
      key={`digit_${props.number}`}
    >
      <div className="number">{props.number}</div>
      <span className="letter">{props.letter}</span>
    </button>
  );
};
