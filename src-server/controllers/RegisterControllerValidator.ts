import { InvalidUserPropertyException } from '../exceptions/InvalidUserPropertyException';

export const isValidPassword = async (password: string) => {
  if (password.length < 10) {
    throw new InvalidUserPropertyException('passwort is too short');
  }

  return Promise.resolve();
};
