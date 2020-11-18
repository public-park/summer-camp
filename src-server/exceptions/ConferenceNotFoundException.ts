import { ApplicationException } from './ApplicationException';

export class ConferenceNotFoundException extends ApplicationException {
  constructor() {
    super(ConferenceNotFoundException.name, 404);
  }
}
