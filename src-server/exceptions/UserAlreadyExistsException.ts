import { ApplicationException } from './ApplicationException';

export class UserAlreadyExistsException extends ApplicationException {
  constructor() {
    super(UserAlreadyExistsException.name, 409);
  }
}
