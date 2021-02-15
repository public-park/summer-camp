import { userRepository } from '../worker';
import { UserActivity } from '../models/UserActivity';
import { InvalidUserPropertyException } from '../exceptions/InvalidUserPropertyException';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExistsException';
import { UserRole } from '../models/UserRole';

const isString = (value: unknown): value is string => {
  return Object.prototype.toString.call(value) === '[object String]';
};

export const isValidTagList = (tags: unknown) => {
  if (!Array.isArray(tags)) {
    throw new InvalidUserPropertyException('tags it not type array');
  }

  if (tags.some((value) => !value)) {
    throw new InvalidUserPropertyException('tags contains empty value');
  }
};

export const isValidName = async (name: unknown) => {
  if (!isString(name)) {
    throw new InvalidUserPropertyException('name it not type string');
  }

  if (await userRepository.getByName(name)) {
    throw new UserAlreadyExistsException();
  }
};

export const isValidActivity = (activity: unknown) => {
  if (!isString(activity)) {
    throw new InvalidUserPropertyException('activity it not type string');
  }

  if (!Object.values(UserActivity).includes(<UserActivity>activity)) {
    throw new InvalidUserPropertyException('activity is unknown');
  }
};

export const isValidRole = (role: unknown) => {
  if (!isString(role)) {
    throw new InvalidUserPropertyException('role it not type string');
  }

  if (!Object.values(UserRole).includes(<UserRole>role)) {
    throw new InvalidUserPropertyException('role is unknown');
  }
};
