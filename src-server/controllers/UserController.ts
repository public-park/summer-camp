import { Response, NextFunction } from 'express';
import { userRepository as users, accountRepository as accounts, authenticationProvider, pool } from '../worker';
import { UserActivity } from '../models/UserActivity';
import { isValidName, isValidTagList, isValidActivity, isValidRole } from './UserControllerValidator';
import { UserRole } from '../models/UserRole';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';

const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await isValidName(req.body.name);

    let tags = new Set<string>();
    let activity = UserActivity.Unknown;
    let role = UserRole.Agent;

    if (req.body.tags) {
      isValidTagList(req.body.tags);

      tags = new Set(req.body.tags);
    }

    if (req.body.activity) {
      isValidActivity(req.body.activity);

      activity = req.body.activity;
    }

    if (req.body.role) {
      isValidRole(req.body.role);

      role = req.body.role;
    }

    const authentication = await authenticationProvider.create(req.body.password);

    const user = await users.create(req.body.name, undefined, tags, req.jwt.account, authentication, role, activity);

    res.json(user.toDocumentWithoutAuthentication());
  } catch (error) {
    return next(error);
  }
};

const fetch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.resource.user) {
      throw new UserNotFoundException();
    }

    res.json(req.resource.user.toDocumentWithoutAuthentication());
  } catch (error) {
    return next(error);
  }
};

const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let user = req.resource.user as User;

    if (req.body.tags) {
      isValidTagList(req.body.tags);

      user.tags = new Set(req.body.tags);
    }

    if (req.body.activity) {
      isValidActivity(req.body.activity);

      user.activity = req.body.activity;
    }

    if (req.body.role) {
      isValidRole(req.body.role);

      user.role = req.body.role;
    }

    user = await users.save(user);

    pool.updateIfExists(await pool.getUserWithSocket(user));

    res.json(user.toDocumentWithoutAuthentication());
  } catch (error) {
    return next(error);
  }
};

const remove = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.resource.user as User;

    await users.remove(user);

    pool.deleteById(user.id);

    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export const UserController = {
  fetch,
  update,
  remove,
  create,
};
