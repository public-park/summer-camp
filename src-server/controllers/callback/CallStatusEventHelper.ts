import { CallStatus } from '../../models/CallStatus';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';

export interface CallStatusEvent {
  callSid: string;
  from: string;
  to: string;
  status: CallStatus;
  duration: number | undefined;
}

export const getDuration = (request: StatusCallbackRequest) => {
  if (request.body.CallStatus !== CallStatus.Completed.toLocaleLowerCase()) {
    return;
  }

  if (request.body.CallDuration) {
    return parseInt(request.body.CallDuration, 10);
  }
};

export const getStatus = (request: StatusCallbackRequest) => {
  switch (request.body.CallStatus) {
    case 'initiated':
      return CallStatus.Initiated;

    case 'ringing':
      return CallStatus.Ringing;

    case 'no-answer':
      return CallStatus.NoAnswer;

    case 'in-progress':
      return CallStatus.InProgress;

    case 'busy':
      return CallStatus.Busy;

    case 'completed':
      return CallStatus.Completed;

    case 'failed':
      return CallStatus.Failed;

    case 'canceled':
      return CallStatus.Canceled;

    default:
      throw new InvalidRequestBodyException(`${request.body.CallStatus} is an unknown status`);
  }
};

export const getFinalInboundCallState = (previous: CallStatus, current: CallStatus) => {
  if ([CallStatus.NoAnswer, CallStatus.Ringing, CallStatus.Queued, CallStatus.Canceled].includes(previous)) {
    return CallStatus.NoAnswer;
  } else {
    return current;
  }
};
