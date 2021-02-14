import React from 'react';
import { PhoneNumberInput } from './PhoneNumberInput';
import { Keypad } from './Keypad';
import { CallButton } from '../Controls/CallButton';
import { OutgoingDisabled } from './OutgoingDisabled';
import { useSelector } from 'react-redux';
import { selectConfiguration, selectHasOutboundEnabled } from '../../../../store/Store';

const getPhoneCanvas = () => {
  return (
    <div className="idle">
      <PhoneNumberInput />
      <Keypad />
      <CallButton />
    </div>
  );
};

const getOutgoingDisabledCanvas = () => {
  return (
    <div className="idle">
      <OutgoingDisabled />
    </div>
  );
};

export const Idle = () => {
  const configuration = useSelector(selectConfiguration);
  const hasOutboundEnabled = useSelector(selectHasOutboundEnabled);

  if (!configuration) {
    return null;
  }

  return hasOutboundEnabled ? getPhoneCanvas() : getOutgoingDisabledCanvas();
};
