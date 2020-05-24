import React from 'react';
import { Display } from './Display';
import { CallButton } from './Controls/CallButton';
import { Keypad } from './Keypad';

export const KeypadCanvas = (props: any) => {
  return (
    <div className="idle">
      <Display />
      <Keypad />
      <CallButton />
    </div>
  );
};
