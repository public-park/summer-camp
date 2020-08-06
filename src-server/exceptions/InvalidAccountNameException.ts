import { ApplicationException } from './ApplicationException';

export class InvalidAccountNameException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidAccountNameException.name, 400, description);
  }
}
