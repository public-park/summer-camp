import { ApplicationException } from './ApplicationException';

export class InvalidSamlAttributeException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidSamlAttributeException.name, 400, description);
  }
}
