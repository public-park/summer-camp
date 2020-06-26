import { Request, Response, NextFunction } from 'express';
import {
  userRepository,
  accountRepository,
  authenticationProvider,
  callRepository,
  pool,
  socketWorker,
} from '../worker';
import { UserActivity } from '../models/UserActivity';
import { AccountNotFoundException } from '../exceptions/AccountNotFoundException';
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

    const user = await userRepository.create(
      req.body.name,
      undefined,
      tags,
      req.user.accountId,
      authentication,
      role,
      activity
    );

    res.json(user.toApiResponse());
  } catch (error) {
    return next(error);
  }
};

const fetch = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    res.json(user.toApiResponse());
  } catch (error) {
    return next(error);
  }
};

const update = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId); // TODO, should update pool and repository

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

    await userRepository.update(user);

    res.json(user.toApiResponse());
  } catch (error) {
    return next(error);
  }
};

const remove = async (req: Request, res: Response, next: any) => {
  try {
    const user = await userRepository.getById(req.params.userId); // TODO, should remove socket, pool and repository

    if (!user) {
      throw new UserNotFoundException();
    }

    await userRepository.delete(user);

    socketWorker.closeSocketByUserId(user.id); // TODO, rename to sockets

    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

const getPresence = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const user = await pool.getUserById(req.params.userId); // TODO, create PoolUserRepository

    if (!user) {
      throw new UserNotFoundException();
    }

    const payload = {
      isOnline: user.isOnline,
      isAvailable: user.isAvailable,
      activity: user.activity,
    };

    res.json(payload);
  } catch (error) {
    return next(error);
  }
};

const getCalls = async (req: RequestWithUser, res: Response, next: any) => {
  try {
    const calls = await callRepository.getCallsByUser(req.user);

    res.json(calls);
  } catch (error) {
    return next(error);
  }
};

export const getConfiguration = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const account = await accountRepository.getById(req.user.accountId);

    if (!account) {
      throw new AccountNotFoundException();
    }

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
  getPresence,
  getConfiguration,
  getCalls,
  fetch,
  update,
  remove,
  create,
};
