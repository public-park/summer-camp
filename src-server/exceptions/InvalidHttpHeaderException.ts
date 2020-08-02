import { ApplicationException } from './ApplicationException';

export class InvalidHttpHeaderException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidHttpHeaderException.name, 403, description);
  }
}
