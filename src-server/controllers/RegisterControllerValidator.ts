import { MAXIMUM_LENGTH_OF_USER_PASSWORD, MINIMUM_LENGTH_OF_USER_PASSWORD } from '../Constants';
import { InvalidUserPropertyException } from '../exceptions/InvalidUserPropertyException';

export const isValidPassword = async (password: string) => {
  if (password.length < MINIMUM_LENGTH_OF_USER_PASSWORD) {
    throw new InvalidUserPropertyException('passwort is too short');
  }

  if (password.length > MAXIMUM_LENGTH_OF_USER_PASSWORD) {
    throw new InvalidUserPropertyException('passwort is too long');
  }

  return Promise.resolve();
};
