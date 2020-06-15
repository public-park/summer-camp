import { Role } from './Role';

export class OwnerRole extends Role {
  constructor() {
    super(
      new Set([
        'account.configuration.update',
        'account.configuration.read',
        'user.phone.create',
        'user.read',
        'user.create',
        'user.calls.read',
      ])
    );
  }
}
