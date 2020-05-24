import { ApplicationException } from './ApplicationException';

export class InvalidContentTypeException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidContentTypeException.name, 415, description);
  }
}
