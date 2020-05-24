import { ApplicationException } from "./ApplicationException";

export class UserNotFoundException extends ApplicationException {

  constructor() {
    super(UserNotFoundException.name, 404)
  }

}