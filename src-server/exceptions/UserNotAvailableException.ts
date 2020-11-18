import { ApplicationException } from './ApplicationException';

export class UserNotAvailableException extends ApplicationException {
  constructor() {
    super(UserNotAvailableException.name, 400);
  }
}
