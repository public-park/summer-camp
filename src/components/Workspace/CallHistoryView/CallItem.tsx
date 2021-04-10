import React from 'react';
import { useCallDurationFormat } from '../PhoneView/hooks/useCallDurationFormat';
import { DateTime } from 'luxon';
import { updatePhoneDisplay } from '../../../actions/PhoneAction';
import { useDispatch } from 'react-redux';
import { CallDirection } from '../../../models/CallDirection';
import { CallStatus } from '../../../models/CallStatus';
import { setView } from '../../../actions/WorkspaceAction';

interface CallItemProps {
  to: string;
  from: string;
  direction: CallDirection;
  duration: number | undefined;
  createdAt: string;
  status: CallStatus;
}

export const CallItem: React.FC<CallItemProps> = ({ from, to, duration, direction, createdAt, status }) => {
  const date = DateTime.fromRFC2822(createdAt);
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
    dispatch(setView('PHONE_VIEW'));
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
            {date.toRelative()} {status === 'completed' && `, ${durationToMinutes} minutes`}
          </h4>
        </div>
      </div>
    </div>
  );
};
