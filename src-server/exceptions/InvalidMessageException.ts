import { ApplicationException } from './ApplicationException';

export class InvalidMessageException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidMessageException.name, 500, description);
  }
}
