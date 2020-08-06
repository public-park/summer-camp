import { ApplicationException } from './ApplicationException';

export class InvalidAccountException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidAccountException.name, 400, description);
  }
}
