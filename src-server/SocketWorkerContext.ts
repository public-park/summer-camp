import { User } from './models/User';
import { UserRepository } from './repository/UserRepository';

export interface SocketWorkerContext {
  options: any;
  users: Map<string, User>;
  repository: UserRepository;
}
