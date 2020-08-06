import { Role } from './Role';

export class AgentRole extends Role {
  constructor() {
    super(new Set(['user.phone.create', 'user.read', 'call.read', 'call.create', 'call.update']));
  }
}
