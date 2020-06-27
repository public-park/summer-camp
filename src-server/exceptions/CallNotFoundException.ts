import { ApplicationException } from './ApplicationException';

export class CallNotFoundException extends ApplicationException {
  constructor() {
    super(CallNotFoundException.name, 404);
  }
}
