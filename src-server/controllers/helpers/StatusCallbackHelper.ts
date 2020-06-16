import { RequestWithAccount } from '../../requests/RequestWithAccount';
import { CallStatus } from '../../models/CallStatus';
import { InvalidRequestBodyException } from '../../exceptions/InvalidRequestBodyException';
import { CallDirection } from '../../models/CallDirection';

export const StatusCallbackHelper = {
  fetchDuration(request: RequestWithAccount) {
    if (request.body.CallStatus !== CallStatus.Completed.toLocaleLowerCase()) {
      return;
    }

    if (request.body.CallDuration) {
      return parseInt(request.body.CallDuration, 10);
    }
  },

  fetchStatus(request: RequestWithAccount) {
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
  },

  getStatusEventUrl(request: RequestWithAccount, direction: CallDirection) {
    const { protocol, hostname, account } = request;

    return `${protocol}://${hostname}/api/callback/accounts/${
      account.id
    }/phone/status-event/${direction.toLocaleLowerCase()}`;
  },
};
