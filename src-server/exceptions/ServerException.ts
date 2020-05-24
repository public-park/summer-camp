import { ApplicationException } from './ApplicationException';

export class ServerException extends ApplicationException {
  constructor(description?: string) {
    super(ServerException.name, 500, description);
  }
}
