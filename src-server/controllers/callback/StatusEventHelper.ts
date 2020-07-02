import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { CallStatus } from '../../models/CallStatus';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';
import { CallDirection } from '../../models/CallDirection';
import { User } from '../../models/User';

export interface CallStatusEvent {
  callSid: string;
  from: string;
  to: string;
  status: CallStatus;
  duration: number | undefined;
}

const getDuration = (request: RequestWithAccount) => {
  if (request.body.CallStatus !== CallStatus.Completed.toLocaleLowerCase()) {
    return;
  }

  if (request.body.CallDuration) {
    return parseInt(request.body.CallDuration, 10);
  }
};

const getStatus = (request: RequestWithAccount) => {
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

export const parseRequest = (request: RequestWithAccount, user: User | undefined = undefined): CallStatusEvent => {
  let callSid;

  if (request.params.direction === CallDirection.Inbound) {
    callSid = request.body.ParentCallSid;
  } else {
    callSid = request.body.CallSid;
  }

  return {
    callSid: callSid,
    from: request.body.From,
    to: request.body.To,
    status: getStatus(request),
    duration: getDuration(request),
  };
};
