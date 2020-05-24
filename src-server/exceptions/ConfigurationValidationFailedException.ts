import { ApplicationException } from './ApplicationException';

export class ConfigurationValidationFailedException extends ApplicationException {
  constructor(description?: string) {
    super(ConfigurationValidationFailedException.name, 422, description);
  }
}
