import { CallStatus } from '../../models/CallStatus';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';
import { StatusCallbackRequest } from '../../requests/StatusCallbackRequest';

export const getDuration = (request: StatusCallbackRequest) => {
  if (getStatus(request) !== CallStatus.Completed) {
    return;
  }

  if (request.body.CallDuration) {
    return parseInt(request.body.CallDuration, 10);
  }
};

export const getStatus = (request: StatusCallbackRequest) => {
  if (!Object.values(CallStatus).includes(request.body.CallStatus)) {
    throw new InvalidRequestBodyException(`${request.body.CallStatus} is an unknown status`);
  }

  return request.body.CallStatus as CallStatus;
};

export const getFinalInboundCallState = (previous: CallStatus, current: CallStatus) => {
  if ([CallStatus.NoAnswer, CallStatus.Ringing, CallStatus.Queued, CallStatus.Canceled].includes(previous)) {
    return CallStatus.NoAnswer;
  } else {
    return current;
  }
};
