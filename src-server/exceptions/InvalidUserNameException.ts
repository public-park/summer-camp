import { ApplicationException } from './ApplicationException';

export class InvalidUserNameException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidUserNameException.name, 400, description);
  }
}
