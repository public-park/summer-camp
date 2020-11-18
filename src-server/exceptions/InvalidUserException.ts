import { ApplicationException } from './ApplicationException';

export class InvalidUserException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidUserException.name, 400, description);
  }
}
