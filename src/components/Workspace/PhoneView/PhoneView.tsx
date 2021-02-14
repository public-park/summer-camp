import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { selectPhoneState, selectPhoneError, selectConfiguration, selectPhoneOverlay } from '../../../store/Store';
import { IncomingCall } from './IncomingCall';
import { Busy } from './Busy';
import { Idle } from './Idle/Idle';
import { Offline } from './Offline';
import { Expired } from './Expired';
import { PhoneException } from './PhoneException';
import { PhoneState } from '../../../phone/PhoneState';
import { Connect } from './Connect';
import { setPhoneOverlay } from '../../../actions/PhoneAction';
import { Keypad } from './Idle/Keypad';

export const PhoneView = () => {
  const state = useSelector(selectPhoneState);
  const error = useSelector(selectPhoneError);
  const configuration = useSelector(selectConfiguration);
  const overlay = useSelector(selectPhoneOverlay);

  const dispatch = useDispatch();

  const hide = () => {
    dispatch(setPhoneOverlay(false));
  };

  const getPhoneView = (): JSX.Element | undefined => {
    if (!configuration || configuration.direction === 'none') {
      return <PhoneException text="The phone is not configured yet, please go to setup" />;
    }

    if (error) {
      return <PhoneException text={`The phone reported an error: ${error}`} />;
    }

    switch (state) {
      case PhoneState.Ringing:
        return <IncomingCall />;
      case PhoneState.Busy:
        return <Busy />;
      case PhoneState.Idle:
        return <Idle />;
      case PhoneState.Offline:
        return <Offline />;
      case PhoneState.Expired:
        return <Expired />;
      case PhoneState.Connecting:
        return <Connect />;
    }
  };

  return (
    <div className="phone">
      <section className={overlay ? 'overlay' : 'overlay overlay-hidden'}>
        <div className="header" onClick={() => hide()}>
          <button className="collapse-button"></button>
        </div>

        <div className="body">
          <Keypad />
        </div>
      </section>

      {getPhoneView()}
    </div>
  );
};
