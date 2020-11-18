import { ApplicationException } from './ApplicationException';

export class ConferenceParticipantNotFoundException extends ApplicationException {
  constructor() {
    super(ConferenceParticipantNotFoundException.name, 404);
  }
}
