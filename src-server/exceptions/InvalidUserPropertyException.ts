import { ApplicationException } from './ApplicationException';

export class InvalidUserPropertyException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidUserPropertyException.name, 400, description);
  }
}
