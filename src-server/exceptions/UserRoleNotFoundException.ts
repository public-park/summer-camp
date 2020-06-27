import { ApplicationException } from './ApplicationException';

export class UserRoleNotFoundException extends ApplicationException {
  constructor() {
    super(UserRoleNotFoundException.name, 500);
  }
}
