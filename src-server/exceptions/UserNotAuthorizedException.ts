import { ApplicationException } from './ApplicationException';

export class UserNotAuthorizedException extends ApplicationException {
  constructor() {
    super(UserNotAuthorizedException.name, 403);
  }
}
