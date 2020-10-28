import { ApplicationException } from './ApplicationException';

export class InvalidDocumentException extends ApplicationException {
  constructor(description?: string) {
    super(InvalidDocumentException.name, 500, description);
  }
}
