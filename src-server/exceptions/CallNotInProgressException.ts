import { ApplicationException } from './ApplicationException';

export class CallNotInProgressException extends ApplicationException {
  constructor() {
    super(CallNotInProgressException.name, 403);
  }
}
