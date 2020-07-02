import { userRepository } from '../worker';
import { UserActivity } from '../models/UserActivity';
import { InvalidUserPropertyException } from '../exceptions/InvalidUserPropertyException';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExistsException';
import { UserRole } from '../models/UserRole';

export const isValidTagList = (tags: Array<any>) => {
  if (!Array.isArray(tags)) {
    throw new InvalidUserPropertyException('tags it not type array');
  }

  if (tags.some((value) => !value)) {
    throw new InvalidUserPropertyException('tags contains empty value');
  }
};

export const isValidName = async (name: string) => {
  if (await userRepository.getByName(name)) {
    throw new UserAlreadyExistsException();
  }
};

export const isValidActivity = (activity: string) => {
  if (!Object.values(UserActivity).includes(<UserActivity>activity)) {
    throw new InvalidUserPropertyException('activity is unknown');
  }
};

export const isValidRole = (role: string) => {
  if (!Object.values(UserRole).includes(<UserRole>role)) {
    throw new InvalidUserPropertyException('role is unknown');
  }
};
