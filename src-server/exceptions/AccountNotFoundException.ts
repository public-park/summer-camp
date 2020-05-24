import { ApplicationException } from './ApplicationException';

export class AccountNotFoundException extends ApplicationException {
  constructor(description?: string) {
    super(AccountNotFoundException.name, 404, description);
  }
}
