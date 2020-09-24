import React from 'react';
import { useCallDurationFormat } from '../PhoneView/hooks/useCallDurationFormat';
import Moment from 'react-moment';
import { updatePhoneDisplay } from '../../../actions/PhoneAction';
import { useDispatch } from 'react-redux';
import { CallDirection, CallStatus } from '../../../phone/Call';
import { setWorkspaceView } from '../../../actions/WorkspaceViewAction';

interface CallItemProps {
  to: string;
  from: string;
  direction: CallDirection;
  duration: number;
  createdAt: Date;
  status: CallStatus;
}

export const CallItem = (props: CallItemProps) => {
  const { from, to, duration, direction, status, createdAt } = props;

  const durationToMinutes = useCallDurationFormat(duration);

  const dispatch = useDispatch();

  const setPhoneNumber = (to: string, from: string, direction: CallDirection) => {
    let value: string = '';

    if (direction === 'inbound') {
      value = from;
    } else {
      value = to;
    }

    dispatch(updatePhoneDisplay(value));
    dispatch(setWorkspaceView('PHONE_VIEW'));
  };

  return (
    <div className="item" onClick={() => setPhoneNumber(to, from, direction)}>
      <div>
        <div className="status">
          <div className={status}>&nbsp;</div>
        </div>

        <div className="detail">
          <h3>
            <span>{direction === 'outbound' ? 'You' : from}</span>
            <span className="status-text">&nbsp;{status === 'completed' ? 'called' : 'tried to call'}&nbsp;</span>
            <span>{direction === 'outbound' ? to : 'you'}</span>
          </h3>

          <h4 className="duration">
            <Moment fromNow>{createdAt}</Moment> {status === 'completed' && `, ${durationToMinutes} minutes`}
          </h4>
        </div>
      </div>
    </div>
  );
};
