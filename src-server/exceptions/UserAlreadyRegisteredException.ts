import { ApplicationException } from './ApplicationException';

export class UserAlreadyRegisteredException extends ApplicationException {
  constructor() {
    super(UserAlreadyRegisteredException.name, 409);
  }
}
