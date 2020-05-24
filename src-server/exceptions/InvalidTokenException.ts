import { ApplicationException } from './ApplicationException';

export class InvalidTokenException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidTokenException.name, 401, description);
  }
}
