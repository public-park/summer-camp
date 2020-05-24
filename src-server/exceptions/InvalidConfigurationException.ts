import { ApplicationException } from './ApplicationException';

export class InvalidConfigurationException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidConfigurationException.name, 422, description);
  }
}
