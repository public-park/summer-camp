import React from 'react';
import { PhoneNumberInput } from './PhoneNumberInput';
import { Keypad } from './Keypad';
import { CallButton } from '../Controls/CallButton';

export const Idle = (props: any) => {
  return (
    <div className="idle">
      <PhoneNumberInput />
      <Keypad />
      <CallButton />
    </div>
  );
};
