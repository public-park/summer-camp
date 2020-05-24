import { userRepository } from '../worker';
import { UserActivity } from '../models/UserActivity';
import { UserAlreadyRegisteredException } from '../exceptions/UserAlreadyRegisteredException';
import { InvalidUserPropertyException } from '../exceptions/InvalidUserPropertyException';

export const isValidLabelList = (labels: Array<any>) => {
  if (!Array.isArray(labels)) {
    throw new InvalidUserPropertyException('labels it not type array');
  }

  if (labels.some((value) => !value)) {
    throw new InvalidUserPropertyException('labels contains empty value');
  }
};

export const isValidName = async (name: string) => {
  if (await userRepository.getByName(name)) {
    throw new UserAlreadyRegisteredException();
  }
};

export const isValidActivity = (activity: string) => {
  if (!(activity in UserActivity)) {
    throw new InvalidUserPropertyException('activity is unknown');
  }
};
