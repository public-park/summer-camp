import { ApplicationException } from './ApplicationException';

export class InvalidCallException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidCallException.name, 500, description);
  }
}
