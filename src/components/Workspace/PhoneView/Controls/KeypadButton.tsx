import React from 'react';

export const KeypadButton = (props: any) => {
  return (
    <button onClick={() => props.addDigit(props.number)} className="digit-button" key={`digit_${props.number}`}>
      <div className="number">{props.number}</div>
      <span className="letter"></span> {props.letters}
    </button>
  );
};
