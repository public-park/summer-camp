import { Response, NextFunction } from 'express';
import { userRepository as users, authenticationProvider, pool, socketWorker } from '../worker';
import { UserActivity } from '../models/UserActivity';

import { RequestWithUser } from '../requests/RequestWithUser';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { isValidName, isValidTagList, isValidActivity, isValidRole } from './UserControllerValidator';
import { ConfigurationNotFoundException } from '../exceptions/ConfigurationNotFoundException';
import { UserRole } from '../models/UserRole';

const create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
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

    const user = await users.create(req.body.name, undefined, tags, req.user.account, authentication, role, activity);

    res.json(user.toResponse());
  } catch (error) {
    return next(error);
  }
};

const fetch = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const user = await users.getById(req.user.account, req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    res.json(user.toResponse());
  } catch (error) {
    return next(error);
  }
};

const update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    let user = await users.getById(req.user.account, req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

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

    user = await users.update(req.user.account, user);

    pool.updateIfExists(pool.getUserWithOnlineState(user));

    res.json(user.toResponse());
  } catch (error) {
    return next(error);
  }
};

const remove = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const user = await users.getById(req.user.account, req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    await users.delete(req.user.account, user);

    pool.delete(pool.getUserWithOnlineState(user));

    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

export const getConfiguration = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = req.user.account;

    if (!account.configuration) {
      throw new ConfigurationNotFoundException();
    }

    res.json({
      inbound: account.configuration.inbound,
      outbound: account.configuration.outbound,
    });
  } catch (error) {
    return next(error);
  }
};

export const UserController = {
  getConfiguration,
  fetch,
  update,
  remove,
  create,
};
