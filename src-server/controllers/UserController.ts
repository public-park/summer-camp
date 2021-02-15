import { Response, NextFunction } from 'express';
import { userRepository as users, accountRepository as accounts, authenticationProvider, pool } from '../worker';
import { UserActivity } from '../models/UserActivity';
import { isValidName, isValidTagList, isValidActivity, isValidRole } from './UserControllerValidator';
import { UserRole } from '../models/UserRole';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { TagMessage } from '../models/socket/messages/TagMessage';
import { ActivityMessage } from '../models/socket/messages/ActivityMessage';

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

    const user = await users.create(req.body.name, undefined, tags, req.jwt.account.id, authentication, role, activity);

    pool.add(user);

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
    if (!req.resource.user) {
      throw new UserNotFoundException();
    }

    let user = req.resource.user;

    if (req.body.tags) {
      isValidTagList(req.body.tags);

      const tags = new Set(req.body.tags as string[]);

      if ([...user.tags].join('') !== [...tags].join('')) {
        user.tags = tags;

        user.broadcast(new TagMessage(user.tags));
      }
    }

    if (req.body.activity) {
      isValidActivity(req.body.activity);

      if (user.activity !== req.body.activity) {
        user.activity = req.body.activity;

        user.broadcast(new ActivityMessage(user.activity));
      }
    }

    if (req.body.role) {
      isValidRole(req.body.role);

      user.role = req.body.role;
    }

    if (req.body.configuration?.phone?.constraints) {
      const { autoGainControl, echoCancellation, noiseSuppression } = req.body.configuration.phone.constraints;

      if (!user.configuration) {
        user.configuration = {
          phone: {
            constraints: {
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true,
            },
          },
        };
      }

      if (autoGainControl !== undefined) {
        user.configuration.phone.constraints.autoGainControl = Boolean(autoGainControl);
      }

      if (echoCancellation !== undefined) {
        user.configuration.phone.constraints.echoCancellation = Boolean(echoCancellation);
      }

      if (noiseSuppression !== undefined) {
        user.configuration.phone.constraints.noiseSuppression = Boolean(noiseSuppression);
      }
    }

    pool.broadcastToAccount(user);

    user = await users.save(user);

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
