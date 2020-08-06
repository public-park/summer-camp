import { ApplicationException } from './ApplicationException';

export class InvalidCallStatusException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidCallStatusException.name, 500, description);
  }
}
