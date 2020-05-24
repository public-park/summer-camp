import { ApplicationException } from './ApplicationException';

export class InvalidUrlException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidUrlException.name, 404, description);
  }
}
