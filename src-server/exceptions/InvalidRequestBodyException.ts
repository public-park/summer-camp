import { ApplicationException } from './ApplicationException';

export class InvalidRequestBodyException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidRequestBodyException.name, 400, description);
  }
}
