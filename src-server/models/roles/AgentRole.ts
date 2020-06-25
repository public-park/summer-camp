import { Role } from './Role';

export class AgentRole extends Role {
  constructor() {
    super(new Set(['user.phone.create', 'user.read', 'user.calls.read']));
  }
}
