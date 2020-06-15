import { Permission } from './Permission';

export class Role {
  permissions: Set<Permission>;

  constructor(permissons: Set<Permission>) {
    this.permissions = permissons;
  }

  hasPermission(name: Permission) {
    return this.permissions.has(name);
  }
}
