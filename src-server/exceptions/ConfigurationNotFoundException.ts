import { ApplicationException } from './ApplicationException';

export class ConfigurationNotFoundException extends ApplicationException {
  constructor(description?: string) {
    super(ConfigurationNotFoundException.name, 404, description);
  }
}
